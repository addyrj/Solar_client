// import React from 'react'
// import App from "../App";
// import { createBrowserRouter } from 'react-router-dom';
// import BaseLayout from '../Views/Layouts/BaseLayout';

// import Register from '../Views/Screens/Register';
// import NewChargerController from '../Views/Screens/NewChargerController';

// // import ChargerController from '../Views/Screens/ChargerController';
// import InternationalDonor from '../Views/Screens/GetDonor.js';
// import InternationalPartner from '../Views/Screens/InternationalPartner';
// // import MobileDevice from '../Views/Screens/MobileDevice';
// import Administrator from '../Views/Screens/Administrator';
// import ShowGraph from '../Views/Screens/ShowGraph';
// import CleanCache from '../Views/Screens/CleanCache';
// import Dashboard2 from '../Views/Screens/Dashboard2';
// import RewDevice from "../Views/Screens/GetRew.js"


// const routes = createBrowserRouter([
//     {
//         path: "/",
//         element: <App />,
//         children: [
//             {
//                 path: "/",
//                 element: <Register />
//             },
//             // {
//             //     path: "/home2",
//             //     element: <BaseLayout><Dashboard /></BaseLayout>
//             // },
//             {
//                 path: "/dashboard",
//                 element: <BaseLayout><Dashboard2 /></BaseLayout>
//             },
//               {
//                 path: "/new_charger_controller",
//                 element: <BaseLayout><NewChargerController /></BaseLayout>
//             },
          
//             // {
//             //     path: "/charger_controller",
//             //     element: <BaseLayout><ChargerController /></BaseLayout>
//             // },
//             {
//                 path: "/international_donor",
//                 element: <BaseLayout><InternationalDonor /></BaseLayout>
//             },
//             {
//                 path: "/international_partner",
//                 element: <BaseLayout><InternationalPartner /></BaseLayout>
//             },
//             {
//                 path: "/rew_device",
//                 element: <BaseLayout><RewDevice /></BaseLayout>
//             },
//             {
//                 path: "/administrator",
//                 element: <BaseLayout><Administrator /></BaseLayout>
//             },
//             {
//                 path: "/show_graph",
//                 element: <BaseLayout><ShowGraph /></BaseLayout>
//             },
//             {
//                 path: "/clean_cache",
//                 element: <BaseLayout><CleanCache /></BaseLayout>
//             },
//         ]
//     }
// ])
// export default routes
// Router/Routes.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import BaseLayout from '../Views/Layouts/BaseLayout';
import Register from '../Views/Screens/Register';
import NewChargerController from '../Views/Screens/GetChargerController.js';
import InternationalDonor from '../Views/Screens/GetDonor.js';
import InternationalPartner from '../Views/Screens/InternationalPartner';
import Administrator from '../Views/Screens/Administrator';
import ShowGraph from '../Views/Screens/ShowGraph';
import CleanCache from '../Views/Screens/CleanCache';
import Dashboard2 from '../Views/Screens/Dashboard2';
import RewDevice from "../Views/Screens/GetRew.js";
import ProtectedRoute from '../Views/Components/ProtectedRoute.js';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Register />
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><Dashboard2 /></BaseLayout>
                    </ProtectedRoute>
                )
            },
            {
                path: "/new_charger_controller",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><NewChargerController /></BaseLayout>
                    </ProtectedRoute>
                )
            },
            {
                path: "/our_donors",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><InternationalDonor /></BaseLayout>
                    </ProtectedRoute>
                )
            },
            {
                path: "/iot_map",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><InternationalPartner /></BaseLayout>
                    </ProtectedRoute>
                )
            },
            {
                path: "/rew_device",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><RewDevice /></BaseLayout>
                    </ProtectedRoute>
                )
            },
            {
                path: "/administrator",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><Administrator /></BaseLayout>
                    </ProtectedRoute>
                )
            },
            {
                path: "/show_graph",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><ShowGraph /></BaseLayout>
                    </ProtectedRoute>
                )
            },
            {
                path: "/clean_cache",
                element: (
                    <ProtectedRoute>
                        <BaseLayout><CleanCache /></BaseLayout>
                    </ProtectedRoute>
                )
            },
        ]
    }
]);

export default router;