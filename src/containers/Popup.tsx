import MainApi from "@/api/main";
import MainApiProtected from "@/api/main-protected";
import Tokens from "@/utils/chrome-storage/tokens";
import React, {
  useEffect,
  useState,
  FC,
  MouseEvent,
  CSSProperties,
} from "react";
import { render } from "react-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { Messages } from "../@types/Constants";
import { store } from "../utils/chrome-storage";
import { sendMessage } from "../utils/send-message";
import { IUser } from "@/containers/service-worker";

type HandleInputs = ({}: { target: { name: string; value: string } }) => void;

const Popup: FC = () => {
  const [activeTabId, setActiveTabId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isStartedSending, setIsStartedSending] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<IUser>({ email: "", password: "" });
  const [errValidationMsg, setErrValidationMsg] = useState({
    email: "",
    password: "",
  });
  const [data, setData] = useState({ email: "" });
  const [api] = useState(MainApi.getInstance());
  const [protectedApi] = useState(MainApiProtected.getInstance());
  const [tokens] = useState(Tokens.getInstance());

  useEffect(() => {
    handleGetIsLoggedIn();

    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const tabId = tabs.length > 0 ? tabs[0].id || 0 : 0;
      setActiveTabId(tabId);
    });
  }, []);

  useEffect(() => {
    if (isStartedSending) {
      setIsLoading(true);
      setIsStartedSending(false);
    }
  }, [isStartedSending]);

  const handleGetIsLoggedIn = async () => {
    setIsStartedSending(true);
    try {
      const { data } = await protectedApi.getMe();

      setData({ email: data?.data.email || "" });
      setIsLoggedIn(true);
      store.set({ isLoggedIn: true });
      setIsLoading(false);
    } catch (error) {
      setIsLoggedIn(false);
      store.set({ isLoggedIn: false });
      setIsLoading(false);
    }
  };

  const handleInputs: HandleInputs = ({ target: { name, value } }) => {
    setErrValidationMsg((prev) => ({ ...prev, [name]: "" }));
    setUser({ ...user, [name]: value });
  };

  const handleClickOnLoginBtn = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user.email || !user.password) {
      const errs = { email: "", password: "" };

      if (!user.email) errs.email = "Email is required field!";
      if (!user.password) errs.password = "Password is required field!";

      return setErrValidationMsg(errs);
    }

    setIsStartedSending(true);

    try {
      const { data, status, message } = await api.login(user);

      if (status !== 200) {
        throw { message, status };
      }
      if (data) {
        const { accessToken, refreshToken } = data;

        await tokens.setAccessToken(accessToken);
        await tokens.setRefreshToken(refreshToken);

        await handleGetIsLoggedIn();

        setIsLoading(false);
      }
    } catch (error) {
      const msg = (error as { message: string }).message;

      setErrValidationMsg({
        email:
          msg.includes("user") || msg.includes("email")
            ? "Can't find user with this email."
            : "",
        password:
          msg.includes("password") || msg.includes("Password")
            ? "Might password is wrong."
            : "",
      });

      console.error(error);
      setIsLoading(false);
    }
  };

  const handleClickOnLogoutBtn = () => {
    protectedApi.getLogout();
    setIsLoggedIn(false);
    setData({ email: "" });
    store.set({ isLoggedIn: false });
  };

  return (
    <PopupStyled>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {isLoggedIn ? (
            <>
              <p style={{ fontSize: "16px", margin: "0 0 12px 0" }}>
                <span style={{ fontWeight: "600" }}>{data.email}</span>
              </p>
              <LogoutBtn type="submit" onClick={handleClickOnLogoutBtn}>
                Logout
              </LogoutBtn>
            </>
          ) : (
            <form
              action="#"
              style={{ display: "flex", flexFlow: "wrap", minWidth: "180px" }}
            >
              <Input
                value={user.email}
                onChange={handleInputs}
                type="email"
                required
                autoFocus
                name="email"
                autoComplete="email"
                placeholder="Enter your email"
                isValid={!errValidationMsg.email}
              />
              {errValidationMsg.email && (
                <ErrorMessage>{errValidationMsg.email}</ErrorMessage>
              )}

              <Input
                value={user.password}
                onChange={handleInputs}
                type="password"
                required
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                isValid={!errValidationMsg.password}
              />
              {errValidationMsg.password && (
                <ErrorMessage>{errValidationMsg.password}</ErrorMessage>
              )}

              <LoginBtn id="login" onClick={handleClickOnLoginBtn}>
                Login
              </LoginBtn>
            </form>
          )}
        </>
      )}
    </PopupStyled>
  );
};

export default Popup;

const PopupStyled = styled.div`
  padding: 8px;
`;

const ErrorMessage = styled.p`
  color: #e44343;
  padding: 0;
  margin: 4px 0 12px 0;
`;

const Input = styled.input<{ isValid: boolean }>`
  width: 100%;
  margin-bottom: ${({ isValid }) => (isValid ? "14px" : 0)};
  border-radius: 4px;
  border: 1px solid ${({ isValid }) => (isValid ? "lightgray" : "#e44343")};
  height: 18px;
  padding: 10px;
  outline: none;

  &:focus {
    border: 1px solid rgb(48, 48, 226);
  }
`;

const LogoutBtn = styled.button`
  border-radius: 4px;
  border: none;
  outline: none;
  padding: 6px 14px;
  background: rgb(122, 122, 245);
  width: 100%;
  cursor: pointer;

  &:hover {
    background: rgb(104, 104, 214);
  }
`;

const LoginBtn = styled.button`
  border-radius: 4px;
  border: none;
  outline: none;
  padding: 6px 14px;
  background: rgb(48, 48, 226);
  color: white;
  height: 34px;
  width: 100%;
  cursor: pointer;

  &:hover {
    background: rgb(40, 40, 189);
  }
`;

const shadowPosition = "1em";
const shadowPositionNegative = "-1em";
const shadowPositionSecond = "1.4em";
const shadowPositionSecondNegative = "-1.4em";

const shadowColor1 = "rgba(0, 0, 0, 0.1)";
const shadowColor2 = "rgba(0, 0, 0, 0.2)";
const shadowColor3 = "rgba(0, 0, 0, 0.3)";
const shadowColor4 = "rgba(0, 0, 0, 0.4)";
const shadowColor5 = "rgba(0, 0, 0, 0.5)";
const shadowColor6 = "rgba(0, 0, 0, 0.6)";
const shadowColor7 = "rgba(0, 0, 0, 0.7)";
const shadowColor8 = "rgba(0, 0, 0, 0.8)";

const loading = keyframes`
  0%,
  100% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor1},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor2},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor3},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor4},
      0em ${shadowPositionSecond} 0 0em ${shadowColor5},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor6},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor7},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor8};
  }
  12.5% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor8},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor1},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor2},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor3},
      0em ${shadowPositionSecond} 0 0em ${shadowColor4},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor5},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor6},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor7};
  }
  25% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor7},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor8},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor1},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor2},
      0em ${shadowPositionSecond} 0 0em ${shadowColor3},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor4},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor5},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor6};
  }
  37.5% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor6},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor7},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor8},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor1},
      0em ${shadowPositionSecond} 0 0em ${shadowColor2},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor3},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor4},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor5};
  }
  50% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor5},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor6},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor7},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor8},
      0em ${shadowPositionSecond} 0 0em ${shadowColor1},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor2},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor3},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor4};
  }
  62.5% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor4},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor5},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor6},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor7},
      0em ${shadowPositionSecond} 0 0em ${shadowColor8},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor1},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor2},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor3};
  }
  75% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor3},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor4},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor5},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor6},
      0em ${shadowPositionSecond} 0 0em ${shadowColor7},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor8},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor1},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor2};
  }
  87.5% {
    box-shadow: 0em ${shadowPositionSecondNegative} 0em 0em ${shadowColor2},
      ${shadowPosition} ${shadowPositionNegative} 0 0em ${shadowColor3},
      ${shadowPositionSecond} 0em 0 0em ${shadowColor4},
      ${shadowPosition} ${shadowPosition} 0 0em ${shadowColor5},
      0em ${shadowPositionSecond} 0 0em ${shadowColor6},
      ${shadowPositionNegative} ${shadowPosition} 0 0em ${shadowColor7},
      ${shadowPositionSecondNegative} 0em 0 0em ${shadowColor8},
      ${shadowPositionNegative} ${shadowPositionNegative} 0 0em ${shadowColor1};
  }
`;

const Loader = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;

  &::after {
    content: "";
    display: block;
    margin: 0;
    background: transparent;
    width: 15%;
    height: 15%;
    border-radius: 50%;
    position: absolute;
    text-indent: -9999em;
    animation: ${loading} 0.8s infinite ease;
  }
`;

render(<Popup />, document.getElementById("popup-root"));
