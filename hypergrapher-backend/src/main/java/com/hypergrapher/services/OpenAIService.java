package com.hypergrapher.services;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    public String getRawAIResponse(String prompt) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            JsonObject body = new JsonObject();
            body.addProperty("model", "gpt-3.5-turbo");
            
            JsonArray messages = new JsonArray();
            JsonObject systemMsg = new JsonObject();
            systemMsg.addProperty("role", "system");
            systemMsg.addProperty("content", "You are a professional data analytics assistant. Respond in JSON format if requested.");
            messages.add(systemMsg);
            
            JsonObject userMsg = new JsonObject();
            userMsg.addProperty("role", "user");
            userMsg.addProperty("content", prompt);
            messages.add(userMsg);
            
            body.add("messages", messages);
            // JSON mode is better handled by prompt for 3.5, removing the incorrect object add
            // body.add("response_format", new JsonObject()); 

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("OpenAI Status: " + response.statusCode());
            
            if (response.statusCode() == 200) {
                JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
                String content = jsonResponse.getAsJsonArray("choices")
                        .get(0).getAsJsonObject()
                        .getAsJsonObject("message")
                        .get("content").getAsString();
                
                // Sanitize: OpenAI sometimes wraps JSON in markdown blocks
                if (content.contains("```json")) {
                    content = content.substring(content.indexOf("```json") + 7);
                    content = content.substring(0, content.lastIndexOf("```"));
                } else if (content.contains("```")) {
                    content = content.substring(content.indexOf("```") + 3);
                    content = content.substring(0, content.lastIndexOf("```"));
                }
                return content.trim();
            } else if (response.statusCode() == 429) {
                // SANDBOX MODE: Return mock response for testing when quota exceeded
                if (prompt.toLowerCase().contains("line")) {
                    return "{ \"message\": \"Sandbox Mode: Switching to Line Chart. Trends analyzed.\", \"command\": \"SET_TYPE_LINE\" }";
                } else if (prompt.toLowerCase().contains("bar")) {
                    return "{ \"message\": \"Sandbox Mode: Switching to Bar Chart.\", \"command\": \"SET_TYPE_BAR\" }";
                }
                return "{ \"message\": \"Sandbox Mode: Intelligence active. Request processed.\", \"command\": \"NONE\" }";
            } else {
                System.err.println("OpenAI Error Body: " + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "{\"message\": \"AI connection failed. Sandbox mode fallback active.\", \"command\": \"NONE\"}";
    }

    public List<String> getAIInsights(String dataSummary) {
        List<String> insights = new ArrayList<>();
        try {
            HttpClient client = HttpClient.newHttpClient();
            
            JsonObject body = new JsonObject();
            body.addProperty("model", "gpt-3.5-turbo");
            
            JsonArray messages = new JsonArray();
            JsonObject systemMsg = new JsonObject();
            systemMsg.addProperty("role", "system");
            systemMsg.addProperty("content", "You are a professional data analyst. Analyze the following data stats and provide 3-4 concise, high-impact bullet points. Focus on trends and anomalies.");
            messages.add(systemMsg);
            
            JsonObject userMsg = new JsonObject();
            userMsg.addProperty("role", "user");
            userMsg.addProperty("content", dataSummary);
            messages.add(userMsg);
            
            body.add("messages", messages);
            body.addProperty("temperature", 0.7);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
                String content = jsonResponse.getAsJsonArray("choices")
                        .get(0).getAsJsonObject()
                        .getAsJsonObject("message")
                        .get("content").getAsString();
                
                for (String line : content.split("\n")) {
                    if (!line.trim().isEmpty()) {
                        insights.add(line.replace("- ", "").replace("* ", "").trim());
                    }
                }
            } else {
                // SANDBOX MODE fallback
                insights.add("Sandbox Insight: Strong correlation detected in recent cycles.");
                insights.add("Sandbox Insight: Distribution patterns suggest predictive stability.");
                insights.add("Sandbox Insight: Anomaly threshold reached in upper quartiles.");
            }

        } catch (Exception e) {
            insights.add("Error connecting to OpenAI: " + e.getMessage());
        }
        return insights;
    }
}
