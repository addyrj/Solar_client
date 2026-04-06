// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from "react-redux";
import { Toaster } from 'react-hot-toast';
import router from './Router/Routes';
import store from "./Database/store";
import { setupAxiosInterceptors } from './Database/Utils';
import reportWebVitals from './reportWebVitals';

// Setup axios interceptors for token expiration
setupAxiosInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);


reportWebVitals();