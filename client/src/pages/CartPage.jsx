import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { API } from "../config/api";
import { useNavigate } from "react-router-dom";
import NavbarUser from "../components/Navbar";
import { useQuery,useMutation } from "react-query";
import midtransConfig from "../config/midtrans";
import { FaSellcast } from "react-icons/fa";
const Cart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [cartList, setCartList] = useState([]);
  let navigate = useNavigate()

  const getCartList = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/cart-user");
      setCartList(res.data.data);
    } catch (error) {
      console.log(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = useMutation(async () => {
    try {
      setIsLoading(true);
      const { value } = await Swal.fire({
        icon: "question",
        text: "Confirm your order?",
        showCancelButton: true,
      });
      if (value) {
        const res = await API.post("/transaction");
        console.log(res);

        const token = res.data.data.token;

        // @ts-expect-error
        window.snap.pay(token, {
          onSuccess: function (result) {
            /* You may add your own implementation here */
            console.log(result);
            navigate("/user/profile");
          },
          onPending: function (result) {
            /* You may add your own implementation here */
            console.log(result);
            navigate("/user/profile");
          },
          onError: function (result) {
            /* You may add your own implementation here */
            console.log(result);
            navigate("/user/profile");
          },
          onClose: function () {
            /* You may add your own implementation here */
            alert("you closed the popup without finishing the payment");
          },
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    //change this to the script source you want to load, for example this is snap.js sandbox env
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    //change this according to your client-key
      const myMidtransClientKey = midtransConfig.clientKey;
    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;
    // optional if you want to set script attribute
    // for example snap.js have data-client-key attribute
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    document.body.appendChild(scriptTag);
    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  const handleDelete = async (data) => {
    try {
      const { value } = await Swal.fire({
        icon: "warning",
        text: "Remove book from cart?",
        showCancelButton: true,
      });
      if (value) {
        const res = await API.delete("/cart/" + data.bookId);
        console.log("response delete cart = ", res);
        getCartList();
        data.refetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatRp = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  useEffect(() => {
    getCartList();
  }, []);

  return (
    <>
    <NavbarUser />
    <div className="px-5 md:px-20">
      <h1 className="mt-1 font-bold text-xl" style={{marginLeft:"260px"}}>My Cart</h1>
      <p  style={{marginLeft:"260px"}} className="mt-1">Review Your Product</p>
      <div className="mt-3 flex flex-col md:flex-row gap-6">
        {cartList?.cart?.length === 0 ? (
          <div>No Books In Cart</div>
        ) : (
          <>
            <div className="border-y-2 py-2 flex flex-col gap-3 md:w-3/5">
              {cartList?.cart?.map((book) => (
                <BookCart book={book} key={book} handleDelete={handleDelete} />
              ))}
            </div>
            <div className="border-t-2 py-2 md:w-2/5" style={{position: "absolute", top: 140, right: 400}}>
  <div style={{color:"green", fontSize:"20px"}} className="flex justify-between py-2">
    <p>Subtotal</p>
    <p>{formatRp(cartList?.total_price)}</p>
  </div>
  <div className="flex justify-between py-2 ">
    <p>Qty</p>
    <p>{cartList?.cart?.length}</p>
  </div>
  <div style={{color:"red",fontSize:"25px"}} className="flex justify-between py-2 border-t-2">
    <p>Total Price</p>
    <p>{formatRp(cartList?.total_price)}</p>
  </div>
  <button style={{fontSize:"20px"}}
    className="btn btn-outline-danger btn-sm"
    onClick={()=>{handlePayment.mutate()}}
    disabled={isLoading}
  >
    {isLoading ? "Loading..." : "Pay" }<FaSellcast style={{fontSize:"20px"}}/>
  </button>
</div>

          </>
        )}
      </div>
    </div>
    </>
  );
};

const BookCart = ({ book, handleDelete }) => {
  const [bookData, setBookData] = useState();
  const getBook = async () => {
    const res = await API.get("/book/" + book);
    setBookData(res.data.data);
  };

  let { refetch } = useQuery("cartUserLengthCache", async () => {
    const res = await API.get("/cart-user");
    return res.data.data
  });

  useEffect(() => {
    getBook();
  }, []);

  const formatRp = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex gap-2">
      <div style={{width:"500px",marginLeft:"260px"}}>
      <img src={bookData?.thumbnail} alt={bookData?.title} style={{width:"100%"}}  />
      </div>
      <div className="flex-1" style={{marginLeft:"260px"}}>
        <p className="font-bold">{bookData?.title}</p>
        <p className="mt-2">By {bookData?.author}</p>
        {bookData?.price && <p className="mt-4" style={{fontSize:"30px", color:"red"}}>{formatRp(bookData?.price)}</p>}
      </div>
      <div>
        <div style={{display:"flex",justifyContent:"center"}}>
        <div style={{width:"100%",display:"flex",justifyContent:"end",marginRight:"300px"}}>
        <button
          className="btn btn-outline-danger btn-sm fw-bold"
          disabled={isLoading}
          onClick={() => handleDelete({bookId: bookData?.id, refetch})}
        >
          {isLoading ? "Loading..." : "Remove"}
        </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;