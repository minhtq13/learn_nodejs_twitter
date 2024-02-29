import User from "~/models/schemas/User.schema";
import databaseService from "./database.serivces";

class UsersService {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload;
    const result = await databaseService.users.insertOne(
      new User({
        email,
        password,
      }),
    );
    return result
  }
  checkEmailExist(email: string) {
    const user =  databaseService.users.findOne({ email });
    return Boolean(user)
  }
}

const usersService = new UsersService();
export default usersService;
