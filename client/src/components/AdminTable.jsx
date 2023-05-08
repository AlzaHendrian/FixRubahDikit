import React from "react";
import { Table } from "react-bootstrap";
import { API } from "../config/api";
import { useQuery } from "react-query";

export default function IncomeTable() {
  let { data: transactions } = useQuery("transactionssCache", async () => {
    const response = await API.get("/transactions");

    return response.data.data;
  });
  console.log("ini trans", transactions);
  const formatIDR = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
  return (
    <>
      <p
        className="text-center mt-5 mb-4"
        style={{
          fontFamily: "times new roman",
          fontSize: "24px",
          fontWeight: "700",
        }}
      >
        Transaction
      </p>
      <div className="d-flex justify-content-center">
        <Table style={{ width: "90%" }} striped>
          <thead>
            <tr>
              <th style={{ color: "firebrick" }}>No</th>
              <th style={{ color: "firebrick" }}>Users</th>
              <th style={{ color: "firebrick" }}>Book Purchased</th>
              <th style={{ color: "firebrick" }}>Total</th>
              <th style={{ color: "firebrick" }}>Status Payment</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map((items, index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{items?.user?.fullname}</td>
                <td>
                  {items?.cart?.map((a) => {
                    return <span>{a?.book?.title} </span>;
                  })}
                </td>

                <td>{formatIDR.format(items?.total)}</td>
                <td
                  className={
                    items.status === "success"
                      ? "text-success"
                      : items.status === "Pending"
                      ? "text-warning"
                      : "text-danger"
                  }
                >
                  {items?.status}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
