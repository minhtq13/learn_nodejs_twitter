import { config } from "dotenv";
import fs from "fs";
import path from "path";
const env = process.env.NODE_ENV; 

const envFilename = `./.env.${env}`;

if (!env) {
  console.log("Bạn chưa cung cấp biến môi trường NODE_ENV (Ví dụ: develolpment, production)");
  console.log(`Phát hiện NODE_ENV = ${env}`);
  process.exit(1);
}
// console.log(`Phát hiện NODE_ENV = ${env}, vì thế app dẽ dùng file môi trường là ${envFilename}`); 
if (!fs.existsSync(path.resolve(envFilename))) {
  console.log(`Không tìm thấy file môi trường ${envFilename}`);
  console.log(`Lưu ý: App không dùng file .env, ví dụ môi trường là development thì app sẽ dùng file .env.development`);
  console.log(`Vui lòng tạo file ${envFilename} và tham khảo nội dung ở file .env.example`);
  process.exit(1);
}
console.log("env", env)

config({
  path: envFilename
});
export const isProduction = env === "production";

// Thêm các file env vào đây và dùng như 1 biến, đỡ phải chỗ nào cũng phải dùng process.env và config()
export const envConfig = {
  port: (process.env.PORT as string) || 4000,
  host: process.env.HOST as string,
};
