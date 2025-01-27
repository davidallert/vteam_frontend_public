import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserEmail, getUserName} from "../utils/auth";

import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { AiOutlineHistory } from "react-icons/ai";
import { TbReceipt } from "react-icons/tb";
import { GrFormPreviousLink } from "react-icons/gr";

const UserInfo = () => {

    const email = getUserEmail();
    const name = getUserName();

    const navigate = useNavigate();
    
  return (
    <div>
      <div>
        <button
          className="pre-button"
          aria-label="Previous"
          onClick={() => navigate("/mapscooter")}
        >
          <GrFormPreviousLink size={28} />
        </button>
      </div>

      <div className="user-container">
        <h1>Hi {name}!</h1>

        <div className="user-info">
          <button
            className="balance-button"
            aria-label="Balance"
            onClick={() => navigate("/balance")}
          >
            <MdOutlineAccountBalanceWallet size={28} />
          </button>

          <button
            className="history-button"
            aria-label="History"
            onClick={() => navigate("/trips")}
          >
            <AiOutlineHistory size={28} />
          </button>

          <button
            className="receipts-button"
            aria-label="Receipts"
            onClick={() => navigate("/receipts")}
          >
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
  );
};
export default UserInfo;
