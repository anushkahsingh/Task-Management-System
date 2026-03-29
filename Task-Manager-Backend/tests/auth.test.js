
const request = require("supertest");
const app = require("../src/app");
test("Register user", async()=>{
 const r = await request(app).post("/api/auth/register")
  .send({email:"x@x.com",password:"123",role:"admin"});
 expect(r.statusCode).toBe(200);
});
