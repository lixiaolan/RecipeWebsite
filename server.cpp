#include "HTTP_Server.hpp"
#include "HTTP_Example_Handlers.hpp"
#include "boost/filesystem.hpp"   // includes all needed Boost.Filesystem declarations
#include <iostream>               // for std::cout
#include <sys/wait.h>

using namespace std;
using namespace boost::filesystem;

class IndexGetHandler : public HTTP_Handler {
  string MakePage() {
    string dir_path = "./recipes/";

    vector<string> fileNames;
    
    directory_iterator end_itr; // default construction yields past-the-end
    string temp;
    for ( directory_iterator itr( dir_path );
          itr != end_itr;
          ++itr ) {
      stringstream ss;
      ss << itr->path().filename().string();
      fileNames.push_back(ss.str());
    }

    // Load index page file
    // Insert GetCard xml
    string cssStatic =  "<link rel=\"stylesheet\" href=\"main.css\">";

    string recipes = "";
    for (string file : fileNames) {
      recipes += "<a href=\"" + dir_path + file + "\">" + file + "</a><br>";
    }

    string body;
    body = body +
      "<!DOCTYPE html> <html> <head> " +
      cssStatic +
      " </head> <body> " +
      " <div> " +
      recipes +
      " </div> " + 
      " </body> </html> ";

    return body;
  }

public:

  bool Process(HTTP_Request* request, HTTP_Response* response) override {
        
    if (request->method != "GET") return false;
    if (!( (request->requestURI == "/recipes") || (request->requestURI == "/recipes/") )) return false;

    response->httpVersion = request->httpVersion;
    response->statusCode = "200";
    response->reasonPhrase = "OK";
    response->body = MakePage();

    return true;
  }
};

string CleanFilePath(string file)
{
  size_t pos;
  string ret = "";

  pos = file.find("%20");
  while (pos != string::npos) {
    ret += file.substr(0, pos) + " ";
    file.erase(0,pos+3);
    pos = file.find("%20");
  }
  ret += file;
  return ret;
}

class RecipeGetHandler : public HTTP_Handler {
  
  string MakePage(string file) {
    string recipe = "";
    string line;
    string cssStatic =  "<link rel=\"stylesheet\" href=\"main.css\">";

    // Remove the %20 tokens from the file path!
    file = "." + CleanFilePath(file);
    
    ifstream myfile(file);

    if (myfile.is_open()) {
      while (getline(myfile,line)) {
        recipe += line + "<br>";
      }
      myfile.close();
    }
    
    string body = "";
    body = body +
      "<!DOCTYPE html> <html> <head> " +
      cssStatic +
      " </head> <body> " +
      recipe +
      " </body> </html> ";

    return body;
  }

public:

  bool Process(HTTP_Request* request, HTTP_Response* response) override {
    
    if (request->method != "GET") return false;
    if (request->requestURI.find("recipes/") == string::npos) return false;

    response->httpVersion = request->httpVersion;
    response->statusCode = "200";
    response->reasonPhrase = "OK";
    response->body = MakePage(request->requestURI);
    
    return true;
  }
};

class URLPostHandler : public HTTP_Handler {

  map<string, string> ParseForm(string body) {

    map<string, string> result;    
    istringstream iss(body);
    string line;

    for (int i = 0; i < 4; i++) getline(iss,line);
    result["url"] = line.substr(0,line.size()-1);
    for (int i = 0; i < 4; i++) getline(iss,line);
    result["fileName"] = line.substr(0,line.size()-1);

    return result;
  }
  
public:

  bool Process(HTTP_Request* request, HTTP_Response* response) override {
    
    if (request->method != "POST") return false;
    if (request->requestURI.find("add") == string::npos) return false;

    // Parse the form
    map<string, string> form = ParseForm(request->body);
    char* url = const_cast<char*>(form["url"].c_str());
    char* fileName = const_cast<char*>(form["fileName"].c_str());
    
    // Create command to run
    char* arg_list[] = {"sh", "get.sh", url, fileName, NULL};
    char* program = "sh";
    
    // Run code to create new file with specified name
    pid_t child_pid;
    int child_status;
    
    // Fork
    child_pid = fork();

    if (child_pid != 0) {
      // Wait for child (if parrent)
      wait(&child_status);

      // Handle errors if any:
      // if (WIFEXITED (child_status))
      //   printf ("the child process exited normally, with exit code %d\n",
      //           WEXITSTATUS (child_status));
      // else
      //   printf ("the child process exited abnormally\n");
    }
    else {
      // Exec (if child)
      execvp(program, arg_list);
      // Only get here if execvp fails
      fprintf(stderr, "an error orccured in execvp\n");
      abort();
    }
    
    // Change request to be GET with specified file
    request->method = "GET";
    request->requestURI = "/recipes/" + form["fileName"];

    // Return false because we have not fully handled the request
    return false;
  }
};

class RemoveHandler : public HTTP_Handler {

public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override {
    string searchTokin = "remove%20";

    // Determine if this handler is a match
    if (request->requestURI.find(searchTokin) == string::npos) return false;

    // Strip the filename from the URI body. The format will be:
    // /remove/name of file
    string file = request->requestURI;
    size_t pos = file.find(searchTokin);
    file.erase(0,pos + searchTokin.size());
    
    // Use boost fs to remove the file
    file = "./recipes/" + CleanFilePath(file);

    char* fileName = const_cast<char*>(file.c_str());
    
    // Create command to run
    char* arg_list[] = {"rm", fileName, NULL};
    char* program = "rm";
    
    // Run code to create new file with specified name
    pid_t child_pid;
    int child_status;
    
    // Fork
    child_pid = fork();

    if (child_pid != 0) {
      // Wait for child (if parrent)
      wait(&child_status);

    }
    else {
      // Exec (if child)
      execvp(program, arg_list);
      // Only get here if execvp fails
      fprintf(stderr, "an error orccured in execvp\n");
      abort();
    }
    // Change request to "get index"x
    request->requestURI = "/";
    
    // Return false
    return false;
  }
};

// class EditWindowHandler : public HTTP_Handler {

// public:
//   bool Process(HTTP_Request* request, HTTP_Response* response) override {
    
//   }

//   void GetRecipe() {
    
//   }

//   void SaveRecipe() {

//   }
  
// }
  
int main(int argc, char *argv[]) {

  HTTP_Server server;
  URLPostHandler UPH;
  RemoveHandler RH;
  RecipeGetHandler RGH;
  IndexGetHandler IGH;
  HTTP_File_Handler FH;

  server.handlers.push_back(&UPH);
  server.handlers.push_back(&RH);
  server.handlers.push_back(&RGH);
  server.handlers.push_back(&IGH);
  server.handlers.push_back(&FH);

  server.Run();
  
  return 1;
}
