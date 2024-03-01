import User from "~/models/schemas/User.schema";
import databaseService from "./database.serivces";
import { RegisterRequestBody } from "~/models/requests/User.requests";

class UsersService {
  async register(payload: RegisterRequestBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
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
