package com.hypergrapher.controllers;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.opencsv.CSVReader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final com.hypergrapher.services.OpenAIService aiService;
    private final com.hypergrapher.repositories.VisualizationRepository visualizationRepo;
    private final com.hypergrapher.repositories.UserRepository userRepository;

    public AnalyticsController(com.hypergrapher.services.OpenAIService aiService, 
                               com.hypergrapher.repositories.VisualizationRepository visualizationRepo,
                               com.hypergrapher.repositories.UserRepository userRepository) {
        this.aiService = aiService;
        this.visualizationRepo = visualizationRepo;
        this.userRepository = userRepository;
    }

    @GetMapping("/history")
    public ResponseEntity<List<com.hypergrapher.entities.Visualization>> getHistory() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        com.hypergrapher.entities.User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return ResponseEntity.status(403).build();
        
        return ResponseEntity.ok(visualizationRepo.findByUserOrderByCreatedAtDesc(user));
    }

    @PostMapping("/chat")
    public ResponseEntity<String> handleChat(@RequestBody String requestBody) {
        try {
            JsonObject jsonRequest = JsonParser.parseString(requestBody).getAsJsonObject();
            String userMessage = jsonRequest.get("message").getAsString();
            
            String prompt = "You are the HYPERGRAPHER AI Assistant. The user says: '" + userMessage + "'. " +
                    "Decide if the user wants to change the chart type (options: line, bar, pie, doughnut), enable forecasting, or just needs an explanation. " +
                    "Return ONLY a JSON object with: 'message' (your response) and 'command' (optional: SET_TYPE_LINE, SET_TYPE_BAR, SET_TYPE_PIE, SET_TYPE_DOUGHNUT, ENABLE_FORECAST, CLEAR_FILTERS). " +
                    "Example: { \"message\": \"Switching to line chart\", \"command\": \"SET_TYPE_LINE\" }";
            
            String fullResponse = aiService.getRawAIResponse(prompt);
            return ResponseEntity.ok(fullResponse);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"message\": \"AI connection failed.\"}");
        }
    }

    @PostMapping("/visualize")
    public ResponseEntity<String> generateVisualization(
            @RequestParam("fileinput") MultipartFile file,
            @RequestParam("graphtype") String graphtype) {
            
        try {
            if (file.isEmpty() || graphtype == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Missing file or graph type\"}");
            }

            // Parse CSV robustly using OpenCSV
            CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()));
            List<String[]> rows = reader.readAll();
            reader.close();

            if (rows.isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"CSV is empty\"}");
            }

            // Transpose the 2D array (rows to columns)
            int numCols = rows.get(0).length;
            List<String[]> columns = new ArrayList<>();
            for (int i = 0; i < numCols; i++) {
                columns.add(new String[rows.size()]);
            }
            
            for (int r = 0; r < rows.size(); r++) {
                String[] row = rows.get(r);
                for (int c = 0; c < row.length; c++) {
                    if (c < columns.size()) {
                        columns.get(c)[r] = row[c].trim();
                    }
                }
            }

            String[] rawLabels = columns.get(0);
            JsonArray labelsArray = new JsonArray();
            for (int i = 1; i < rawLabels.length; i++) {
                labelsArray.add(rawLabels[i]);
            }

            JsonArray datasetsArray = new JsonArray();
            Random random = new Random();

            if (graphtype.equals("pie") || graphtype.equals("doughnut")) {
                JsonObject datasetObj = new JsonObject();
                if (columns.size() > 1) {
                    datasetObj.addProperty("label", columns.get(1)[0]);
                    JsonArray dataArray = new JsonArray();
                    JsonArray bgColors = new JsonArray();
                    
                    for (int j = 1; j < columns.get(1).length; j++) {
                        try {
                            dataArray.add(Double.parseDouble(columns.get(1)[j]));
                        } catch(Exception e) {
                            dataArray.add(0);
                        }
                        // Use more modern colors later, random for now
                        bgColors.add(generateRandomColor(random));
                    }
                    datasetObj.add("data", dataArray);
                    datasetObj.add("backgroundColor", bgColors);
                    datasetObj.addProperty("borderWidth", 1);
                    datasetsArray.add(datasetObj);
                }
            } else {
                for (int i = 1; i < columns.size(); i++) {
                    String[] col = columns.get(i);
                    JsonObject datasetObj = new JsonObject();
                    datasetObj.addProperty("label", col[0]);
                    
                    JsonArray dataArray = new JsonArray();
                    for (int j = 1; j < col.length; j++) {
                        try {
                            dataArray.add(Double.parseDouble(col[j]));
                        } catch(Exception e) {
                            dataArray.add(0);
                        }
                    }
                    
                    String color = generateRandomColor(random);
                    datasetObj.addProperty("backgroundColor", color.replace("0.7)", "0.5)"));
                    datasetObj.addProperty("borderColor", color.replace("0.7)", "1)"));
                    datasetObj.addProperty("borderWidth", 2);
                    datasetObj.addProperty("tension", 0.4); // For smooth line charts
                    datasetObj.add("data", dataArray);
                    datasetsArray.add(datasetObj);
                }
            }

            JsonObject responseData = new JsonObject();
            responseData.addProperty("type", graphtype);
            
            // Logic for Recommendation
            String recommendation = "bar";
            if (rawLabels.length > 1) {
                long uniqueLabels = java.util.Arrays.stream(rawLabels).distinct().count();
                if (uniqueLabels < rawLabels.length / 2.0 && rawLabels.length > 5) {
                    recommendation = "pie";
                } else if (rawLabels.length > 15) {
                    recommendation = "line";
                }
            }
            responseData.addProperty("recommendedType", recommendation);
            
            // Generate Insights
            responseData.add("insights", calculateInsights(columns, rawLabels));
            
            JsonObject dataObj = new JsonObject();
            dataObj.add("labels", labelsArray);
            dataObj.add("datasets", datasetsArray);
            
            responseData.add("data", dataObj);

            Gson gson = new Gson();
            
            // --- NEW: Persistence Logic ---
            try {
                String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
                com.hypergrapher.entities.User user = userRepository.findByUsername(username).orElse(null);

                com.hypergrapher.entities.Visualization viz = new com.hypergrapher.entities.Visualization();
                viz.setFileName(file.getOriginalFilename());
                viz.setChartType(graphtype);
                viz.setChartData(gson.toJson(dataObj));
                viz.setInsights(gson.toJson(responseData.get("insights")));
                viz.setUser(user); // LINK TO USER
                visualizationRepo.save(viz);
            } catch (Exception e) {
                System.err.println("Database save failed: " + e.getMessage());
            }
            // ------------------------------

            return ResponseEntity.ok(gson.toJson(responseData));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Server processing error: " + e.getMessage() + "\"}");
        }
    }

    private JsonObject calculateInsights(List<String[]> columns, String[] labels) {
        JsonObject insights = new JsonObject();
        JsonArray highlights = new JsonArray();
        
        if (columns.size() < 2) return insights;

        for (int i = 1; i < columns.size(); i++) {
            String[] col = columns.get(i);
            String title = col[0];
            double max = -Double.MAX_VALUE;
            double min = Double.MAX_VALUE;
            double sum = 0;
            int count = 0;
            List<Double> values = new ArrayList<>();

            for (int j = 1; j < col.length; j++) {
                try {
                    double val = Double.parseDouble(col[j]);
                    if (val > max) max = val;
                    if (val < min) min = val;
                    sum += val;
                    count++;
                    values.add(val);
                } catch (Exception ignored) {}
            }

            if (count > 0) {
                double avg = sum / count;
                highlights.add("The dataset '" + title + "' peaked at " + max + ".");
                highlights.add("Average value for '" + title + "' is " + String.format("%.2f", avg) + ".");
                
                // Anomaly Detection (Simple Outlier check)
                double variance = 0;
                for (double v : values) variance += Math.pow(v - avg, 2);
                double stdDev = Math.sqrt(variance / count);
                
                for (int j = 0; j < values.size(); j++) {
                    if (Math.abs(values.get(j) - avg) > 2 * stdDev) {
                        highlights.add("Anomaly detected in " + title + " at row " + (j + 1) + ": Value " + values.get(j) + " is significantly outside normal range.");
                        break; // Only report first anomaly for now
                    }
                }

                // Trend detection
                if (values.size() > 2) {
                    double firstVal = values.get(0);
                    double lastVal = values.get(values.size() - 1);
                    if (lastVal > firstVal * 1.2) {
                        highlights.add("Strong growth trend detected in " + title + " (+ " + String.format("%.1f", (lastVal/firstVal - 1)*100) + "%).");
                    } else if (lastVal < firstVal * 0.8) {
                        highlights.add("Significant decline detected in " + title + ".");
                    }
                }
            }
        }

        // Call OpenAI for qualitative reasoning
        StringBuilder summaryBuilder = new StringBuilder("Here are the statistics for the dataset: ");
        for (JsonElement highlight : highlights) {
            summaryBuilder.append(highlight.getAsString()).append(" ");
        }
        
        List<String> aiHighlights = aiService.getAIInsights(summaryBuilder.toString());
        for (String aiH : aiHighlights) {
            highlights.add("AI_THINK: " + aiH);
        }

        insights.add("highlights", highlights);
        return insights;
    }

    private String generateRandomColor(Random random) {
        int r = random.nextInt(156) + 100; // brighter colors
        int g = random.nextInt(156) + 100;
        int b = random.nextInt(156) + 100;
        return "rgba(" + r + "," + g + "," + b + ",0.7)";
    }
}
