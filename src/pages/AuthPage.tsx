import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
export const AuthPage: React.FC = () => {
    const [params] = useSearchParams();
    const [register, setRegister] = useState(params.get("mode") === "register");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, register: signUp } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            if (register) await signUp(username, password);
            else await login(username, password);
            navigate("/");
        } catch (e: any) {
            setError(e.message);
        }
    };
    return (
        <div
            className="form-shell"
            style={{ maxWidth: 440, margin: "2rem auto" }}
        >
            <h1>{register ? t("createAccount") : t("welcomeBack")}</h1>
            <p>
                {register
                    ? t("registerIntro")
                    : t("loginIntro")}
            </p>

            <form onSubmit={submit}>
                <div className="form-group">
                    <label className="form-label">{t("username")}</label>
                    <input
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        minLength={3}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">{t("password")}</label>
                    <input
                        className="form-control"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                </div>
                <button className="btn btn-brand" type="submit">
                    {register ? t("register") : t("login")}
                </button>
            </form>
            <button
                className="btn btn-outline"
                style={{ marginTop: "1rem" }}
                onClick={() => setRegister(!register)}
            >
                {register
                    ? `${t("login")}?`
                    : `${t("register")}?`}
            </button>
        </div>
    );
};
