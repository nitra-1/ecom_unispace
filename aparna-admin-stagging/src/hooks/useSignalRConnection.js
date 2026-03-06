import * as signalR from "@microsoft/signalr";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getDeviceId } from "../lib/GetBaseUrl";

const useSignalRConnection = (url, onMessage, trigger) => {
  const { userInfo } = useSelector((state) => state?.user);
  useEffect(() => {
    if (!trigger) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `${url}?${
          url?.includes("notification")
            ? `ReceiverId=${userInfo?.userId}`
            : `clientId=${getDeviceId()}`
        }`
      )
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log("SignalR Connected!"))
      .catch((err) =>
        console.error("SignalR connection error:", err.toString())
      );

    connection.on("ReceiveMessage", (message, count, totalCount) => {
      onMessage(message, count, totalCount);
    });

    return () => {
      connection.stop();
    };
  }, [url, trigger]);
};

export default useSignalRConnection;
