import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserEmail, getUserBalance, getUserName} from "../utils/auth";

import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { AiOutlineHistory } from "react-icons/ai";
import { TbReceipt } from "react-icons/tb";
import { GrFormPreviousLink } from "react-icons/gr";


const UserInfo = () => {

    const email = getUserEmail();
    const balance = getUserBalance();
    const name = getUserName();

    const navigate = useNavigate();
    return (

        <div>
        <div>
            <button className="pre-button" onClick={() => navigate("/mapscooter")}>
            <GrFormPreviousLink size={28} />
            </button>
        </div>
        <div className="user-container">
            <h1>Hi  {name} !</h1>
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
                    <p>{name}</p>
                </button>
                <button>
                    <p>Email</p>
                    <p>{email}</p>
                </button>
            </div>
        </div>
        </div>
    )
}
export default UserInfo