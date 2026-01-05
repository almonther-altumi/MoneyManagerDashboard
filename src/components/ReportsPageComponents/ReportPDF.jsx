import React from "react";



const ReportPDF = React.forwardRef((props , ref) => {
    return(
        <div
            ref = {ref}
            style = {{
                width: "794px", // A4 width
                padding: "24px",
                background: "#ffffff",
                color: "#000",
                fontFamily: "Arial",
            }}

            >
        

        {/* Header */}
      <h1 style={{ textAlign: "center" }}>Statistics Report</h1>
      <p>Date: {new Date().toLocaleDateString()}</p>
      <p>Account: (Owner)</p>

      <hr />

      {/* Summary */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <div>Revenue: 12,000</div>
        <div>Orders: 240</div>
        <div>Users: 120</div>
      </div>

      {/* Charts */}
      <div style={{ marginTop: "30px" }}>
        <h3>Analytics</h3>
        {/* هنا ضع Charts نفسها */}
      </div>

      {/* Table */}
      <div style={{ marginTop: "30px" }}>
        <h3>Details</h3>
        <table width="100%" border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Month</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>January</td>
              <td>4000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

        
    )
})

export default ReportPDF;