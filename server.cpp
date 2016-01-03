#include "HTTP_Server.hpp"
#include "HTTP_Example_Handlers.hpp"
#include <iostream>               // for std::cout
#include <sys/wait.h>

using namespace std;

// Function to handle the fork exec process for a sytem command
// specified by single string.
void SystemCall(string command) {
  vector<string> commandPieces;
  istringstream iss(command);
  string commandPiece;

  // Parse out the command string
  while (iss >> commandPiece) {
    commandPieces.push_back(commandPiece);
  }

  // Create command to run
  char* arg_list[commandPieces.size()+1];
  for (unsigned i = 0; i < commandPieces.size(); i++) {
    arg_list[i] = const_cast<char*>(commandPieces[i].c_str());
  }
  arg_list[commandPieces.size()] = NULL;
  
  // char* arg_list[] = {"sh", "writeDirToFile.sh", dirPath, "dir", NULL};
  char* program = arg_list[0];
    
  // Run code to create new file with specified name
  pid_t child_pid;
  int child_status;
    
  // Fork
  child_pid = fork();

  if (child_pid != 0) {
    // Wait for child (if parrent)
    wait(&child_status);

    // Handle errors if any:
    if (WIFEXITED (child_status))
      printf ("the child process exited normally, with exit code %d\n",
              WEXITSTATUS (child_status));
    else
      printf ("the child process exited abnormally\n");
  }
  else {
    // Exec (if child)
    execvp(program, arg_list);
    // Only get here if execvp fails
    fprintf(stderr, "an error orccured in execvp\n");
    abort();
  }
}

class DirectoryGetHandler : public HTTP_Handler {
  string requiredUIRPrefix;
  
  string MakePage(string dirPathStr) {

    SystemCall("sh writeDirToFile.sh " + dirPathStr + " dir");
        
    ifstream myfile("dir");
    string recipes = "";
    string line;
    
    if (myfile.is_open()) {
      while (getline(myfile,line)) {
        recipes += "<a href=\"" + line + "\">" + line + "</a><br>";
      }
      myfile.close();
    }

    // Load index page file
    // Insert GetCard xml
    string cssStatic =  "<link rel=\"stylesheet\" href=\"main.css\">";

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
  DirectoryGetHandler(string prefix) : requiredUIRPrefix{prefix} {};
  
  bool Process(HTTP_Request* request, HTTP_Response* response) override {

    string uri = request->requestURI;
    
    if (request->method != "GET") return false;
    if (!(uri[uri.size()-1] == '/')) return false;
    if (request->requestURI.find(requiredUIRPrefix) != 0) return false;
    uri = "." + uri;
    
    response->httpVersion = request->httpVersion;
    response->statusCode = "200";
    response->reasonPhrase = "OK";
    response->body = MakePage(uri);

    return true;
  }
};

// class IndexGetHandler : public HTTP_Handler {
//   string MakePage() {
//     string dir_path = "recipes/";

//     vector<string> fileNames;
    
//     directory_iterator end_itr; // default construction yields past-the-end
//     string temp;
//     for ( directory_iterator itr( dir_path );
//           itr != end_itr;
//           ++itr ) {
//       stringstream ss;
//       ss << itr->path().filename().string();
//       fileNames.push_back(ss.str());
//     }

//     // Load index page file
//     // Insert GetCard xml
//     string cssStatic =  "<link rel=\"stylesheet\" href=\"main.css\">";

//     string recipes = "";
//     for (string file : fileNames) {
//       recipes += "<a href=\"" + file + "\">" + file + "</a><br>";
//     }

//     string body;
//     body = body +
//       "<!DOCTYPE html> <html> <head> " +
//       cssStatic +
//       " </head> <body> " +
//       " <div> " +
//       recipes +
//       " </div> " + 
//       " </body> </html> ";

//     return body;
//   }

// public:

//   bool Process(HTTP_Request* request, HTTP_Response* response) override {
        
//     if (request->method != "GET") return false;
//     if (!(request->requestURI == "/recipes/")) return false;

//     response->httpVersion = request->httpVersion;
//     response->statusCode = "200";
//     response->reasonPhrase = "OK";
//     response->body = MakePage();

//     return true;
//   }
// };

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

// Handler to manage the post request sent upon adding a recipe from
// the add.html form.
class AddHandler : public HTTP_Handler {

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

    // Get the recipe from source and parse it
    map<string, string> form = ParseForm(request->body);
    SystemCall("sh get.sh " + form["url"] + " " + form["fileName"]);
    
    // Change request to be GET with specified file
    request->method = "GET";
    request->requestURI = "/recipes/all/" + form["fileName"];

    // Return false because we have not fully handled the request
    return false;
  }
};

class RemoveHandler : public HTTP_Handler {

public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override {
    string searchTokin = "?remove=";

    // Determine if this handler is a match
    if (request->requestURI.find(searchTokin) == string::npos) return false;

    // Strip the filename from the URI body. The format will be:
    // /remove/name of file
    string file = request->requestURI;
    size_t pos = file.find(searchTokin);
    file.erase(0,pos + searchTokin.size());
    
    // Use fork and exec to remove the file
    file = CleanFilePath(file);

    SystemCall("find ./recipes/ -name \"" + file + "\" -delete");
    
    // Change request to "get index"
    request->requestURI = "/";
    
    // Return false
    return false;
  }
};

enum class StrikeValueType {STRING, FILE_PATH};

class StrikeValue {
public:
  StrikeValue() {type = StrikeValueType::STRING;}
  StrikeValue(string s) : str(s) {
    type = StrikeValueType::STRING;
  }
  StrikeValue(string s, StrikeValueType svt) : str(s), type(svt) {}  
  string str;
  StrikeValueType type;
};

// The purpose of this function is to replace any string of the form:
// !@#$%^&*(<arg>) with the contents of the file indicated by
// <arg>. The map takes <arg> to a file path where the replacement
// resource can be found. Currently, this function provides NO safety
// at all. It can get stuck in an infinite loop if the file inserted
// always contains another !@#$%^&*(<arg>) tokin.
string StrikeProcess (string filePath, map<string, StrikeValue> argToStrikeValueMap)
{
  string line;
  ifstream myfile(filePath);
  string result = "";
  string tokinStart = "!@#$%^&*(";
  string tokinEnd = ")";
  
  if (myfile.is_open()) {
    while (getline(myfile,line)) {
      result += line + "\n";
    }
    myfile.close();
  }

  size_t posTokinStart;
  size_t posArgumentEnd;
  string resultFirstHalf;
  string resultSecondHalf;
  string innerString;
  string argument;
  
  while (1) {
    posTokinStart = result.find(tokinStart);
    if (posTokinStart == string::npos) break;
    posArgumentEnd = result.find(tokinEnd, posTokinStart);
    if (posArgumentEnd == string::npos) break;
    argument = result.substr(posTokinStart + tokinStart.size(),(int)posArgumentEnd - ((int)posTokinStart + (int)tokinStart.size()));

    // Check if argument is in the map. If not, set inserter string to
    // "". Otherwise, get the file path from the map and extract its
    // contents into innerString.
    auto it = argToStrikeValueMap.find(argument);
    if (it != argToStrikeValueMap.end()) {
      StrikeValue strikeValue = argToStrikeValueMap[argument];
      innerString = "";

      switch (strikeValue.type) {

        // String case
      case StrikeValueType::STRING:
        innerString = strikeValue.str;
        break;
        
        // File path case
      case StrikeValueType::FILE_PATH:
        ifstream innerFile(strikeValue.str);
        if (innerFile.is_open()) {
          while (getline(innerFile,line)) {
            innerString += line + "\n";
          }
          innerFile.close();
        }
        else {
          innerString = "";
        }
        break;

      }
    }

    // Get the result string before and after the !@#$%^&*(<arg>)
    // construct. Then inject the innerString into the result.
    resultFirstHalf = result.substr(0,posTokinStart);
    resultSecondHalf = result.substr(posArgumentEnd + 1);
    result = resultFirstHalf + innerString + resultSecondHalf;
  }

  // Return the result
  return result;
};

class EditHandler : public HTTP_Handler {
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override {
    string searchTokin = "?edit=";

    // Determine if this handler is a match
    if (request->requestURI.find(searchTokin) == string::npos) return false;

    // Strip the filename from the URI body. The format will be:
    // /remove/name of file
    string file = request->requestURI;
    size_t pos = file.find(searchTokin);
    file.erase(0,pos + searchTokin.size());
    
    map<string, StrikeValue> strikeMap;

    strikeMap["RECIPE"] = StrikeValue("./recipes/all/" + CleanFilePath(file),StrikeValueType::FILE_PATH);
    strikeMap["ACTION"] = StrikeValue("/recipes/all/?save=" + file,StrikeValueType::STRING);
    
    response->httpVersion = request->httpVersion;
    response->statusCode = "200";
    response->reasonPhrase = "OK";
    response->body = StrikeProcess("edit.!@#$%^&*()",strikeMap);

    return true;
  }
};

// Function that takes the name of a recipe and udpates the tag
// information based on tagLine
void UpdateTagInfo(string recipe, string tagLine){
  // Check if tagLine is empty:
  if (tagLine == "") return;

  // Remove all tags currently associated with recipe
  SystemCall("find ./recipes/ -type l -name \"" + recipe + "\" -delete");
  
  istringstream iss(tagLine);
  string line;

  // In a loop:
  //   1. Parse the tagLine
  //   2. Add symbolic link for each tag specified
  while (1) {
    getline(iss,line,',');
    if (!iss) break;
    cout << "UpdateTagInfo: " << line << endl;
    SystemCall("sh addSymbolicLinks.sh " + recipe + " " + line);
  }
}

class SaveRecipes : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {
    if (request->method != "POST") return false;
    string searchTokin = "recipes.json";
    // Determine if this handler has 'recipes.json' in the uri
    if (request->requestURI.find(searchTokin) == string::npos) return false;

    istringstream iss(request->body);
    string filePath = "recipes.json";
    ofstream ofs(filePath);
    string line;
    while (getline(iss,line)) {
      ofs << line << "\n";
    }

    return true;
  }
};

class SaveRecipeText : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {
    if (request->method != "POST") return false;
    string searchTokin = "recipes/";
    // Determine if this handler has 'recipes.json' in the uri
    if (request->requestURI.find(searchTokin) == string::npos) return false;

    istringstream iss(request->body);

    // Need the . to keep file path local
    string filePath = "." + request->requestURI;
    ofstream ofs(filePath);
    string line;
    while (getline(iss,line)) {
      ofs << line << "\n";
    }

    return true;
  }
};

// This "handles" a POST or PUT if it does not match the security
// string. "handling" the request prevents any other handler from
// taking effect.
class SecurityTest : public HTTP_Handler
{
public:
  bool Process(HTTP_Request* request, HTTP_Response* response) override
  {

    // Get authentication string from security file:
    ifstream ifs("./security");
    string password;
    getline(ifs, password);

    // If requesting the security file, return if file matches the
    // Authentication (yes or no)
    if ((request->method == "GET") && (request->requestURI == "/security")) {
      if (request->headers["Authentication"] == password) {
        response->body = "yes";
      }
      else {
        response->body = "no";
      }
      return true;
    }

    // Otherwise, if this is any POST or PUT, check security:
    
    if ((request->method != "POST") &&
        (request->method != "PUT")) return false;
    
    // Compare authentication string to header
    if (request->headers["Authentication"] != password)
      return true;

    return false;
  }
};


int main(int argc, char *argv[]) {
   
  // Create handlers:
  SecurityTest ST;
  HTTP_File_Handler FH;
  SaveRecipeText SRT;
  SaveRecipes SR;
  
  // Create server
  HTTP_Server server;

  // add handlers
  // server.handlers.push_back(&ST);
  server.handlers.push_back(&SR);
  server.handlers.push_back(&SRT);
  server.handlers.push_back(&FH);
  
  server.Run();
  
  return 1;
}
