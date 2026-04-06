// Views/Layouts/BaseLayout.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Navigation from "../Components/Navigation";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import {
    changeFilterSearchModelState,
    changeModalState,
} from "../../Database/Action/ConstantAction";
import FilterModal from "../Components/Modal/FilterModal";
import SortModal from "../Components/Modal/SortModal";
import SettingModal from "../Components/Modal/SettingModal";
import Loader from "../Components/Loader";
import ChnageThme from "../Components/ChnageThme";
import Profile from "../Components/Profile";
import Cookies from "universal-cookie";
import FilterSearchModal from "../Components/Modal/FilterSearchModal";
import { filterModelStyle } from "../../Style/ModalStyle";
import "../../Style/modal_custom.css";
import NewCreateCharger from "../Components/Modal/NewCreateCharger";
import CreateCharger from "../Components/Modal/CreateCharger";
import CreatePartner from "../Components/Modal/CreatePartner";
import CreateDonor from "../Components/Modal/CreateDonor";
import CreateAdministrator from "../Components/Modal/CreateAdministrator";
import { checkTokenExpiration, logout } from '../../Database/logout';
import toast from "react-hot-toast";

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        padding: "0px",
        marginRight: "-50%",
        overflow: "scroll",
        backgroundColor: "#151535",
        transform: "translate(-50%, -50%)",
    },
};

const BaseLayout = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const modalState = useSelector((state) => state.ConstantReducer.modalState);
    const createModastate = useSelector(
        (state) => state.ConstantReducer.createModastate
    );
    const filterModelState = useSelector(
        (state) => state.ConstantReducer.filterModelState
    );
    const cookies = new Cookies();
  
    const loader = useSelector((state) => state.ConstantReducer.loader);
    const [checkThme, setCheckTheme] = useState("dark");
    const [themeSetting, setThemeSetting] = useState({
        headerColor: "",
        headerTextColor: "",
        bodyColor: "",
        themeColor: "",
        themeColorTitile: "",
    });

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    useEffect(() => {
        setCheckTheme(cookies.get("solorTheme"));
    }, [checkThme]);

    useEffect(() => {
        const themeCookie = cookies.get("themeSetting");
        if (themeCookie !== undefined) {
            setThemeSetting(themeCookie);
        }
    }, []);
    
    // Function to check token expiration and redirect if needed
    const checkTokenAndRedirect = () => {
        const cookies = new Cookies();
        const token = cookies.get("adminToken");
        
        if (!token) {
            // No token, redirect to login
            navigate("/");
            return false;
        }
        
        try {
            // Decode token to check expiration
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            if (payload.exp) {
                const expirationTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                
                if (currentTime >= expirationTime) {
                    // Token expired
                    cookies.remove("adminToken");
                    cookies.remove("rememberMe");
                    toast.error("Your session has expired. Please login again.");
                    navigate("/");
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error("Error checking token expiration:", error);
            return false;
        }
    };
    
    useEffect(() => {
        // Check token on component mount
        checkTokenAndRedirect();
        
        // Check token expiration periodically (every 30 seconds)
        const interval = setInterval(() => {
            checkTokenAndRedirect();
        }, 30000); // Check every 30 seconds
        
        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <body
            className={`layout-top-nav fixed ${checkThme === "light" ? "light-skin" : "dark-skin"
                } ${!themeSetting
                    ? "theme-primary"
                    : themeSetting?.themeColorTitile === ""
                        ? "theme-primary"
                        : themeSetting?.themeColorTitile
                } `}
        >
            <div className="wrapper">
                {loader && <Loader />}
                <Modal
                    isOpen={modalState?.openState}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={() =>
                        dispatch(
                            changeModalState({
                                openState: false,
                                content: "",
                                dataColumn: [],
                                data: [],
                            })
                        )
                    }
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    {modalState.content === "filterModal" ? (
                        <FilterModal />
                    ) : modalState.content === "sortModal" ? (
                        <SortModal />
                    ) : modalState.content === "settingModal" ? (
                        <SettingModal />
                    ) : (
                        ""
                    )}
                </Modal>

                <Modal
                    isOpen={filterModelState}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={() => dispatch(changeFilterSearchModelState(false))}
                    style={filterModelStyle}
                    contentLabel="Example Modal"
                >
                    <FilterSearchModal />
                </Modal>

                <div
                    className="modal fade"
                    id="createModal"
                    tabIndex={-1}
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-center">
                        <div className='modal-content'>
                            <NewCreateCharger />

                            {createModastate?.screenName === "ChargerController" ? (
                                <CreateCharger />
                            ) : createModastate?.screenName === "Partner" ? (
                                <CreatePartner />
                            ) : createModastate?.screenName === "Donor" ? (
                                <CreateDonor />
                            ) : createModastate?.screenName === "Administrator" ? (
                                <CreateAdministrator />
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                </div>
                <Header />
                <Navigation />
                {children}
                <Footer />
                <ChnageThme />
                <Profile />
                <div className="control-sidebar-bg"></div>
            </div>
        </body>
    );
};

export default BaseLayout;