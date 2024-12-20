import React, { useState } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as XLSX from 'xlsx';  // Import XLSX for exporting to Excel
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [selectedRange, setSelectedRange] = useState([null, null]); // Store start and end date as range
  const [payrollData, setPayrollData] = useState({
    TeresaMcMillin: { grossSales: '', hours: '', sales: '', editable: true, submitted: false },
    RachelBojka: { grossSales: '', hours: '', sales: '', editable: true, submitted: false },
    MichaelDaniels: { grossSales: '', hours: '', sales: '', editable: true, submitted: false },
    Veronica: { grossSales: '', hours: '', sales: '', editable: true, submitted: false },
    Luz: { grossSales: '', hours: '', sales: '', editable: true, submitted: false },
    Atul: { grossSales: '', hours: '', sales: '', editable: true, submitted: false },
  });

  // Handle range selection
  const handleCalendarChange = (range) => {
    setSelectedRange(range);  // range[0] = start date, range[1] = end date
  };

  // Handle changes in payroll data for each person
  const handlePayrollChange = (person, field, value) => {
    setPayrollData({
      ...payrollData,
      [person]: {
        ...payrollData[person],
        [field]: value,
      }
    });
  };

  // Submit all payroll data
  const handleSubmitAll = () => {
    const updatedPayrollData = {};
    Object.keys(payrollData).forEach(person => {
      updatedPayrollData[person] = {
        ...payrollData[person],
        editable: false,  // Disable further editing after submission
        submitted: true,  // Mark as submitted
      };
    });

    setPayrollData(updatedPayrollData);
  };

  // Toggle the editing state for all employees
  const handleEditAll = () => {
    const updatedPayrollData = {};
    Object.keys(payrollData).forEach(person => {
      updatedPayrollData[person] = {
        ...payrollData[person],
        editable: true,  // Enable editing for all employees
        submitted: false,  // Mark as editable
      };
    });

    setPayrollData(updatedPayrollData);
  };

  // Export payroll data to Excel with dynamic file naming based on date range
  const handleExport = () => {
    const exportData = [];
    const columnWidths = [];  // Array to store column width based on data length
    
    for (let person in payrollData) {
      exportData.push({
        Name: person.replace(/([A-Z])/g, ' $1').trim(),
        GrossSales: payrollData[person].grossSales,
        Hours: payrollData[person].hours,
        Sales: payrollData[person].sales,
        StartDate: selectedRange[0] ? selectedRange[0].toLocaleDateString() : '', // Start Date
        EndDate: selectedRange[1] ? selectedRange[1].toLocaleDateString() : '', // End Date
      });

      // Calculate column widths based on max string length
      columnWidths.push(
        Math.max(
          person.replace(/([A-Z])/g, ' $1').trim().length,
          payrollData[person].grossSales.toString().length,
          payrollData[person].hours.toString().length,
          payrollData[person].sales.toString().length,
          selectedRange[0] ? selectedRange[0].toLocaleDateString().length : 0,
          selectedRange[1] ? selectedRange[1].toLocaleDateString().length : 0
        )
      );
    }

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData, { skipHeader: false });

    // Set column widths
    const columnWidthsInExcel = columnWidths.map(width => ({ wpx: width * 10 })); // Adjust the multiplier for desired width
    ws['!cols'] = columnWidthsInExcel;

    // Generate dynamic file name based on the selected range, formatted as "3/1 - 3/31"
    const formatDate = (date) => date ? `${date.getMonth() + 1}/${date.getDate()}` : '';
    const startDateFormatted = formatDate(selectedRange[0]);
    const endDateFormatted = formatDate(selectedRange[1]);

    const fileName = `PayRoll ${startDateFormatted} - ${endDateFormatted}.xlsx`;

    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
    XLSX.writeFile(wb, fileName); // Generate and download the file
  };

  return (
    <div className="App">
      <h1>Payroll Upload and Export</h1>

      {/* Calendar for Start and End Dates */}
      <div className="calendar-container">
        <div>
          <label>Select Start and End Dates: </label>
          <Calendar
            selectRange={true}
            onChange={handleCalendarChange}
            value={selectedRange}
          />
        </div>
      </div>

      {/* Payroll Input Fields for Each Person */}
      <h2>Payroll Data</h2>
      <div className="start-end-date">
        <label>Start Date:</label>
        <input
          type="text"
          value={selectedRange[0] ? selectedRange[0].toLocaleDateString() : ''}
          readOnly
        />
      </div>

      {Object.keys(payrollData).map(person => (
        <div key={person} className="employee-container">
          <div className="employee-info">
            {/* Employee Name */}
            <div className="employee-name">
              <h3>{person.replace(/([A-Z])/g, ' $1').trim()}</h3>
            </div>

            {/* Employee Input Fields */}
            <div className="employee-fields">
              <label>Gross Sales: </label>
              <input
                type="number"
                value={payrollData[person].grossSales}
                onChange={(e) => handlePayrollChange(person, 'grossSales', e.target.value)}
                disabled={!payrollData[person].editable}
              />
              <label>Hours: </label>
              <input
                type="number"
                value={payrollData[person].hours}
                onChange={(e) => handlePayrollChange(person, 'hours', e.target.value)}
                disabled={!payrollData[person].editable}
              />
              <label>Sales: </label>
              <input
                type="number"
                value={payrollData[person].sales}
                onChange={(e) => handlePayrollChange(person, 'sales', e.target.value)}
                disabled={!payrollData[person].editable}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Submit All Employees Button */}
      {!Object.values(payrollData).every(employee => employee.submitted) && (
        <button onClick={handleSubmitAll}>Submit All</button>
      )}

      {/* Edit All Employees Button */}
      {Object.values(payrollData).every(employee => employee.submitted) && (
        <button onClick={handleEditAll}>Edit All</button>
      )}

      {/* Export to Excel Button */}
      <button onClick={handleExport}>Export Payroll to Excel</button>
    </div>
  );
}

export default App;
