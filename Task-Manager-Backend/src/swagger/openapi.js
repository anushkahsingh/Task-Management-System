
module.exports = {
 openapi:"3.0.0",
 info:{title:"Advanced Task API",version:"2.0.0"},
 paths:{
  "/api/auth/login":{post:{summary:"Login"}},
  "/api/auth/refresh":{post:{summary:"Refresh Token"}},
  "/api/tasks/{teamId}":{get:{summary:"List Tasks with pagination"}}
 }
};
