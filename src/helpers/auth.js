import axios from "axios";
import { setAuthorization } from "./general";

export function login(credentials) {
  return new Promise((res, rej) => {
    axios
      .post(
        "http://192.168.1.19:7771/api/auth/login",
        credentials
      )
      .then(response => {
        setAuthorization(response.data.access_token);
        res(response.data);
      })
      .catch(err => {
        console.log(err);
        rej("Wrong email or password");
      });
  });
}
export function getLocalUser() {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    return null;
  }

  return JSON.parse(userStr);
}
