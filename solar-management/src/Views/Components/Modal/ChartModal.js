import React from "react";
import styled from "styled-components";
import { chrtListOpt2 } from "../../../JavaScript/ChartMain";
import { chhoseGraphState } from "../../../Database/Action/ConstantAction";
import { useDispatch } from "react-redux";

const ChartModal = () => {
  const dispatch = useDispatch();
  
  return (
    <Wrapper>
      <div className="modal-layout">
        <p className="header-title">Filter Tables</p>
        <p style={{ color: "white", fontWeight: "bold" }}>
          Other <span className="text-danger">Graph</span> Options :
        </p>
        <hr />
        <div className="modal-custom-body col-lg-12 col-md-12 col-sm-12 d-flex">
          <div className="col-12 mb-20">
            <div className="row row-cols-1 row-cols-lg-4 g-6 graphlayout">
              {chrtListOpt2.map((item, index) => {
                return (
                  <div key={item.id || index} style={{ margin: "10px 0px" }}>
                    <img
                      src={item.path}
                      alt={item.title}
                      style={{ width: "200px", height: "200px" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.png"; // Fallback image
                      }}
                    />
                    <p className="text-white">{item.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <hr />
        <div className="modal-footer ml-auto d-flex">
          <button
            className="footer-button"
            style={{ marginRight: "15px" }}
            onClick={() => dispatch(chhoseGraphState(false))}
          >
            Cancel
          </button>
          <button
            className="footer-button"
            onClick={() => dispatch(chhoseGraphState(false))}
          >
            Apply
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .modal-layout {
    width: 700px;
    height: 350px;
    background-color: #151535;
    padding: 10px 25px;
    z-index: 999;
    overflow-y: auto;
  }
  .applyButton {
    text-decoration: none;
    width: 140px;
    height: 3rem;
    max-width: auto;
    background-color: #f26b0f;
    color: rgb(255 255 255);
    border: none;
    text-transform: uppercase;
    text-align: center;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    &:hover,
    &:active {
      box-shadow: 0 2rem 2rem 0 rgb(132 144 255 / 30%);
      box-shadow: ${({ theme }) => theme.colors.shadowSupport};
      background-color: #0042a5;
      transform: scale(0.96);
    }

    a {
      text-decoration: none;
      color: rgb(255 255 255);
      font-size: 1.8rem;
    }
  }
  .colorBox {
    width: 80px;
    height: 80px;
    cursor: pointer;
    &:hover,
    &:active {
      border: 1px solid white;
      transform: scale(0.96);
    }
  }

  .footer-button {
    background-color: #0052cc;
    padding: 10px 20px 10px 20px;
    color: white;
    margin: 5px;
    border: none;
    cursor: pointer;
    &:hover,
    &:active {
      background-color: transparent;
      border: 1px solid;
      border-color: ${({ theme }) => theme.colors.themeColor};
      color: white;
      font-weight: bold;
      transform: scale(0.96);
    }
  }
`;

export default ChartModal;