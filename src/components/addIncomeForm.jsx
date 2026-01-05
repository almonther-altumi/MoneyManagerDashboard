
import { collection, addDoc } from "firebase/firestore";
import { db , auth } from "../firebase";
import { useRef, useState } from "react";
function addIncomeForm() {

   
    const [title , setTitle] = useState("");
    const [amount , setAmount] = useState("");
    const [date , setDate] = useState("");

    const AddIncome = async () => {
        
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("User not logged in");
            return;
        }
        // users > userId > his : income , expenses and other collections 
        const docRef = await addDoc(collection(db, "users" , user.uid,"income" ), {
        title: title,
        amount: parseFloat(amount),
        date: new Date(date),
        });
        alert("تمت الإضافة بنجاح: ", docRef.id);
           // إعادة ضبط الحقول بعد الإضافة
      setTitle("");
      setAmount("");
      setDate("");
    } catch (e) {
        console.error("حدث خطأ: ", e);
    }
    };

                

    return (
    
        

        <div>
            <h3>Hellp</h3>
            <div>
                <label htmlFor="income-title">Title:</label>
                <input onChange={(e) => setTitle(e.target.value)} type="text" id="income-title" name="income-title" required />
                <br />
                <label htmlFor="income-amount">Amount:</label>
                <input onChange={(e) => setAmount(e.target.value)} type="number" id="income-amount" name="income-amount" required />
                <br />
                <label htmlFor="income-date">Date:</label>
                <input onChange={(e) => setDate(e.target.value)} type="date" id="income-date" name="income-date" required />
                <br />
                <button onClick={AddIncome}>Add Income</button>
            </div>
        </div>
    );
}

export default addIncomeForm;