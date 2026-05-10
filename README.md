# HYPERGRAPHER-A-Data-Visualization-Tool-Java
The growth of data in the present world is drastically increased, where tons of data is produced from different fields. Due to this enormous growth of data, the value of data becomes an important factor in every aspect. It is a complex task for the companies to explore and visualize very large datasets. Every company should follow some protocol to have accurate insight from analysis of large volume of data. This strategy helps organizations to enhance their process and to find the new product and service opportunities that they may have otherwise missed. 

Data visualization is an increasingly important tool for presenting and analysing complex data sets. The ability to create effective data visualizations can help decision makers to quickly and accurately understand patterns and relationships within data, leading to more informed and effective decision making.

This project aims to develop a data visualization tool using Java Servlet and the Chart.js library, which will allow users to create interactive visualizations of their data. The tool will be built using HTML and will be accessible via a web interface. The project will focus on providing a user-friendly interface for data upload and customization of visualizations, allowing users to easily upload their data and customize their visualizations to meet their specific needs. The visualizations will be built using the Chart.js library, which provides a wide range of customizable charts and graphs.

The goal of this project is to create a flexible and easy-to-use data visualization tool that can be used by a wide range of users. By making it easier to analyse and understand complex data, this tool can help to improve decision making and drive more impactful outcomes.

## Objectives of the project
The main objective of the project is to develop a data visualization tool using Java Servlet and the Chart.js library, which will allow users to create interactive visualizations of their data. In order to achieve this main objective, the project has been divided into multiple targets. The general targets include:
 - Create a UI : To provide a user-friendly interface for data upload and customization of visualizations
 - Import data: To allow users to easily upload their data in the form of .csv file. 
 - Recognize entities: To recognize different entities present in the CSV file and customize their visualizations to meet specified needs.
 - Representation:  The visualizations will be built using the Chart.js library, which provides a wide range of customizable charts and graphs.

## Architecture
The MVC architecture, or Model-View-Controller architecture, is a design pattern commonly used in web development to separate an application into three distinct components: the Model, the View, and the Controller.
- Model: The Model represents the data and business logic of the application. In our project, the Model is responsible for fetching data from the CSV file and processing it so that it can be used by the View component. The Model is also responsible for updating and modifying the data, such as when the user makes changes to a visualization.

- View: The View is responsible for displaying the data to the user in a way that is understandable and easy to interact with. In our project, the View is the user interface that displays the charts and visualizations created using the Chart.js library. The View communicates with the Controller to make changes to the data or request new data to be displayed.

- Controller: The Controller acts as an intermediary between the Model and the View components. It receives input from the user and updates the Model accordingly. The Controller also receives requests from the View to modify the data and updates the View with the appropriate changes. In our project, the Controller is responsible for receiving user input and passing it to the Model to make changes to the data. It is also responsible for updating the View with the appropriate changes based on user input.
 
By separating an application into these three distinct components, the MVC architecture allows for greater flexibility and easier maintenance of the application. It also allows for more efficient and organized development, as each component can be developed independently and tested separately.
![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/4eb2f8f4-f1b5-448a-b89b-7923169a2f18)

## Algorithm
1.	Import required packages and libraries (e.g. javax.servlet, Chart.js)
2.	Create a servlet that extends HttpServlet and overrides the doGet() method.
3.	In the doGet() method, parse the CSV file and store the data in an appropriate data structure (e.g. ArrayList).
4.	Use the data structure to create the necessary Chart.js data objects (e.g. ChartData, ChartOptions) to generate the desired chart.
5.	Generate the HTML and JavaScript code required to display the chart using Chart.js.
6.	Write the HTML and JavaScript code to the servlet's response output stream.
7.	Run the HTML page on eclipse IDE.
8.	The HTML page calls the servlet in a web browser to display the generated chart. 

## Flowchart
![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/8da23cf7-cb97-4819-9eb8-c86151496b8d)

## Results
Initially a HTML page is opened, which prompts the user to upload the CSV file which contains the data they want visualized. 

![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/6607cb2d-6fe1-46b3-8d38-50106805b4af) 
![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/82540f51-9dc2-4748-9b68-f2d57a458383)

The tool is run on a local server and accessed through a web browser. The file is uploaded and the type of graph is chosen by the user. Finally, the “Plot Graph” button is clicked to execute the doGet() method of the servlet. The tool reads the data from the CSV file, processes it using Chart.js, and displays the resulting chart on the web page 

![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/fa4a389c-eda4-4c05-bf68-a413f66a60b6)

Each point on the plotted graph can be viewed for the y-axis value for easier accessibility and readability.  Hence the user can view the exact value of x-axis entity without having to trace the point back to the y-axis line and instead can just hover the pointer over the plotted graph to view it.

![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/3af04d77-5885-4d91-9069-03d8a2cc6465)
An added feature of the produced graph is that the user can easily download the graph in a PNG format for further use in any document of their choice. The user just has to hover over the graph and save the image 

![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/79599b89-b238-4a45-a43f-45c1a42a4cad)

The data visualization tool built can be used to generate the following types of graphs based on the given data and the requirements of the user –
- Line Graph
- Bar Graph
- Pie Graph
- Doughnut Graph
![image](https://github.com/Abhirambs-08/HYPERGRAPHER-A-Data-Visualization-Tool-Java/assets/119886477/7dd1cfe5-6105-4fb7-a9ee-b9902e4cb56d)
