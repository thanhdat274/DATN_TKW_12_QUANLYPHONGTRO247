import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const app = initializeApp({
    apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // cái này mọi người tự gen ra mã ở firebase nha
    authDomain: "xxxxxxxxxxxxxxxxxxxxxx",
    projectId: "mxxxxxxxxxxxxxxxxxxxxxxxx7",
    storageBucket: "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    messagingSenderId: "93130090266",
    appId: "1:93130090266:web:0dd4601aef59b6745c2ea3"
});

// Firebase storage reference
const storage = getStorage(app);
export default storage;
