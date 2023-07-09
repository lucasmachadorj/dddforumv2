
import axios from "axios";
import { RegistrationForm } from "../../../pages/registrationPage/domainObjects/registrationForm";
import { CreateUserResponse } from "../dtos/usersDTOs.shared";
import { GlobalCache, UsersState } from "../../persistence/globalState";

export class UserRepository {
  constructor(private cache: GlobalCache) {}

  public async createUser(
    registrationForm: RegistrationForm,
    onSuccess: (userState: UsersState) => void,
    onFailure: (err: unknown) => void
  ) {
    // Make the request
    try {
      let response = await axios({
        method: "POST",
        // TODO: Use config for this
        url: "http://localhost:3000/users/new",
        data: registrationForm.toCreateUserDTO(),
      });

      // Save the data somewhere shared so it can be accessed later
      let createUserResponse: CreateUserResponse = response.data;

      this.cache.set("users", {
        me: createUserResponse.data,
      });

      return onSuccess(this.cache.get("users"));
    } catch (err) {
      return onFailure(err);
    }
  }
}
