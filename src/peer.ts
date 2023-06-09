import { Peer } from "peerjs";

export const peer = new Peer({
    host: "https://peer-server-5p7e.onrender.com",
    port: 3001,
    path: "/",
    secure: false,
  });
  