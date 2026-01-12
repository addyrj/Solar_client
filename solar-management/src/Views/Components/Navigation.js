import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import styled from "styled-components";
import Cookies from "universal-cookie";
import UploadDataModal from '../Screens/UploadData';

const Navigation = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [activeNav, setActiveNav] = useState("");
    const cookies = new Cookies();
    const themeCookie = cookies.get("themeSetting");

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [themeSetting, setThemeSetting] = useState({
        headerColor: "",
        headerTextColor: "",
        bodyColor: "",
        themeColor: "",
        themeColorTitile: ""
    });

    useEffect(() => {
        if (themeCookie !== undefined) {
            setThemeSetting(themeCookie);
        }
    }, []);

    useEffect(() => {
        location.pathname === "/"
            ? setActiveNav("dashboard")
            : location.pathname === "/new_charger_controller"
                ? setActiveNav("new_charge_controller")
                // : location.pathname === "/charger_controller"
                //     ? setActiveNav("charge_controller")
                : location.pathname === "/international_donor"
                    ? setActiveNav("international_donor")
                    : location.pathname === "/international_partner"
                        ? setActiveNav("international_partner")
                        : location.pathname === "/mobile_device"
                            ? setActiveNav("mobile_device")
                            : location.pathname === "/administrator"
                                ? setActiveNav("administrator")
                                : location.pathname === "/setting"
                                    ? setActiveNav("setting")
                                    : location.pathname === "/upload_data"
                                        ? setActiveNav("upload_data")
                                        : setActiveNav("/");
    }, [location.pathname]);


    return (
        <Wrapper>
            <nav
                className="main-nav"
                role="navigation"
                style={{ backgroundColor: themeSetting.headerColor }}
            >
                {/* Mobile menu toggle button (hamburger/x icon) */}
                <input id="main-menu-state" type="checkbox" />
                <label className="main-menu-btn" htmlFor="main-menu-state">
                    <span className="main-menu-btn-icon" /> Toggle main menu visibility
                </label>
                {/* Sample menu definition */}
                <ul
                    id="main-menu"
                    className="sm sm-blue"
                    style={{ backgroundColor: themeSetting.headerColor }}
                >
                    <li>
                        <NavLink
                            to={"/dashboard"}
                            className=""
                            style={{ color: themeSetting.headerTextColor }}
                        >
                            <i data-feather="home">
                                <span className="path1" />
                                <span className="path2" />
                            </i>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={"/new_charger_controller"}
                            style={{ color: themeSetting.headerTextColor }}
                        >
                            <i data-feather="cpu"> {/* You can change the icon if you prefer */}
                                <span className="path1" />
                                <span className="path2" />
                            </i>
                            Latest Controller
                        </NavLink>
                    </li>
                    <li>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            style={{
                                background: '#6a4cff',
                                border: 'none',
                                color: '#f9fbfe',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.5rem 1rem',
                                fontSize: 'small',
                                // borderRadius: '7px',
                            }}
                        >
                            {/* <i data-feather="cpu">
                                <span className="path1" />
                                <span className="path2" />
                            </i> */}
                            Upload Device Data
                        </button>
                    </li>
                  
                    <li>
                        <NavLink
                            to={"/international_donor"}
                            style={{ color: themeSetting.headerTextColor }}
                        >
                            <i data-feather="gift">
                                <span className="path1" />
                                <span className="path2" />
                            </i>
                            All Donors
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={"/international_partner"}
                            style={{ color: themeSetting.headerTextColor }}
                        >
                            <i data-feather="users">
                                <span className="path1" />
                                <span className="path2" />
                            </i>
                            Iot Systems & Map
                        </NavLink>
                    </li>
                    {/* <li>
                        <NavLink
                            to={"/mobile_device"}
                            style={{ color: themeSetting.headerTextColor }}
                        >
                            <i data-feather="smartphone">
                                <span className="path1" />
                                <span className="path2" />
                            </i>
                            Mobile Devices
                        </NavLink>
                    </li> */}
                    <li>
                        <NavLink
                            to={"/administrator"}
                            style={{ color: themeSetting.headerTextColor }}
                        >
                            <i data-feather="user-check">
                                <span className="path1" />
                                <span className="path2" />
                            </i>
                          Administrative use
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <UploadDataModal
                show={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            />
        </Wrapper>
    );
};

const Wrapper = styled.section`
  .active {
    background: ${({ theme }) => theme.colors.themeColor};
    /* background: #0052cc; */
    color: #ffffff !important;
  }
  .sm-blue {
    li {
      margin: 0 2px 0 2px;
    }
  }
`;

export default Navigation;
