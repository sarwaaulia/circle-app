import { StrictMode } from "react";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./redux.ts";
import App from "./App.tsx";
import axios from 'axios';
import ReactDOM from "react-dom/client"

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:9001/api/v1';

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</StrictMode>,
);
