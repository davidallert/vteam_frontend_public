import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserEmail, getUserBalance} from "../utils/auth";

import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { AiOutlineHistory } from "react-icons/ai";
import { TbReceipt } from "react-icons/tb";


// Can I get the amount, name, surname from the login data?? I am getting 'null'.


const UserInfo = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    //const [email, setEmail] = useState("");
    //const [balance, setBalance] = useState("");


    const email = getUserEmail();
    //const balance = getUserBalance();

    const navigate = useNavigate();
    return (
        <div className="user-container">
            <h1>Hi Username!</h1>
            <div className="user-info">
                <button className="balance-button"
                onClick={() => navigate("/balance")}>
                    <MdOutlineAccountBalanceWallet size={28} />
                </button>

                <button className="history-button">
                    <AiOutlineHistory size={28} />
                </button>

                <button className="receipts-button">
                    <TbReceipt size={28} />
                </button>
            </div>
            <div className="user-details">
                <button>
                    <p>Name</p>
                    <p>User name</p>
                </button>
                <button>
                    <p>Email</p>
                    <p>User Email</p>
                </button>
            </div>
        </div>
    )
}
export default UserInfo