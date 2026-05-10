package Data_Visualizer;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@WebServlet("/HelloForm")
@MultipartConfig(fileSizeThreshold = 1024 * 1024, maxFileSize = 1024 * 1024 * 10, maxRequestSize = 1024 * 1024 * 11)
public class HelloForm extends HttpServlet {
    private static final long serialVersionUID = 1L;

    public HelloForm() {
        super();
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            String graphtype = request.getParameter("graphtype");
            Part filePart = request.getPart("fileinput");
            
            if (filePart == null || graphtype == null) {
                sendError(out, "Missing fileinput or graphtype");
                return;
            }

            InputStream fileContent = filePart.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(fileContent));
            
            List<String[]> list = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                if(line.trim().isEmpty()) continue;
                String[] values = line.split(",");
                for (int a = 0; a < values.length; a++) {
                    if (list.size() <= a) {
                        list.add(new String[0]);
                    }
                    String[] oldArr = list.get(a);
                    String[] newArr = new String[oldArr.length + 1];
                    System.arraycopy(oldArr, 0, newArr, 0, oldArr.length);
                    newArr[newArr.length - 1] = values[a].trim();
                    list.set(a, newArr);
                }
            }
            reader.close();

            if (list.isEmpty()) {
                sendError(out, "CSV is empty.");
                return;
            }

            // list.get(0) contains the first column (labels)
            // list.get(1...n) contains datasets
            
            String[] rawLabels = list.get(0);
            // x-axis labels are elements 1 to end of the first column
            JsonArray labelsArray = new JsonArray();
            for (int i = 1; i < rawLabels.length; i++) {
                labelsArray.add(rawLabels[i]);
            }

            JsonArray datasetsArray = new JsonArray();
            Random random = new Random();

            if (graphtype.equals("pie") || graphtype.equals("doughnut")) {
                JsonObject datasetObj = new JsonObject();
                // For pie/doughnut, we usually plot the first data column (list.get(1))
                // with labels corresponding to the rows.
                if (list.size() > 1) {
                    datasetObj.addProperty("label", list.get(1)[0]);
                    JsonArray dataArray = new JsonArray();
                    JsonArray bgColors = new JsonArray();
                    
                    for (int j = 1; j < list.get(1).length; j++) {
                        try {
                            dataArray.add(Double.parseDouble(list.get(1)[j]));
                        } catch(Exception e) {
                            dataArray.add(0); // fallback
                        }
                        int r = random.nextInt(256);
                        int g = random.nextInt(256);
                        int b = random.nextInt(256);
                        bgColors.add("rgba(" + r + "," + g + "," + b + ",0.7)");
                    }
                    datasetObj.add("data", dataArray);
                    datasetObj.add("backgroundColor", bgColors);
                    datasetObj.addProperty("borderWidth", 1);
                    datasetsArray.add(datasetObj);
                }
            } else {
                // Line or Bar
                for (int i = 1; i < list.size(); i++) {
                    String[] col = list.get(i);
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
                    
                    int r = random.nextInt(256);
                    int g = random.nextInt(256);
                    int b = random.nextInt(256);
                    
                    datasetObj.addProperty("backgroundColor", "rgba(" + r + "," + g + "," + b + ",0.5)");
                    datasetObj.addProperty("borderColor", "rgba(" + r + "," + g + "," + b + ",1)");
                    datasetObj.addProperty("borderWidth", 1);
                    datasetObj.add("data", dataArray);
                    datasetsArray.add(datasetObj);
                }
            }

            JsonObject responseData = new JsonObject();
            responseData.addProperty("type", graphtype);
            
            JsonObject dataObj = new JsonObject();
            dataObj.add("labels", labelsArray);
            dataObj.add("datasets", datasetsArray);
            
            responseData.add("data", dataObj);

            Gson gson = new Gson();
            out.print(gson.toJson(responseData));

        } catch (Exception e) {
            e.printStackTrace();
            sendError(out, "Server error: " + e.getMessage());
        }
    }

    private void sendError(PrintWriter out, String message) {
        JsonObject error = new JsonObject();
        error.addProperty("error", message);
        out.print(error.toString());
    }
}
