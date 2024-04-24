// Import Web3.js
//const Web3 = require('web3');
// Initialize Web3 instance
//import { readFileSync } from 'fs';

// Define the ABI of the Solidity contract
async function loadContractABI() {
    try {
        const response = await fetch('../configurations/contractABI.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading contract ABI:', error);
    }
}

var chosenDoctorAddress = '';
var contract = null;

// Admin address
var contractAdmin = '0xcF7C2D4e51971028DC81340A874175f6438C8286';

async function initializeContract() {
    const ganacheProvider = 'http://127.0.0.1:7545';
    const web3 = new Web3(ganacheProvider);
    const contractABI = await loadContractABI();

    // Define the address of the deployed Solidity contract
    const contractAddress = '0x763740fd354511d14898F668f5f9b7d5Cb1e2D63';

    // Create a contract instance
    contract = new web3.eth.Contract(contractABI, contractAddress);

    // Fetch all patients
    contract.methods.getAllPatients().call((error, patients) => {
        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            console.log('Patients:', patients);
        }
    });

    // Fetch all doctors
    contract.methods.getAllDoctors().call((error, doctors) => {
        if (error) {
            console.error('Error fetching doctors:', error);
        } else {
            console.log('Doctors:', doctors);
        }
    });
}

// Function to populate doctor list
async function populateDoctors() {
    const doctors = await contract.methods.getAllDoctors().call();
    console.log(doctors);
    const doctorSelect = document.getElementById('doctorSelect');
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.workPlace;
        option.textContent = doctor.name;
        doctorSelect.appendChild(option);
    });

    // Event listener for when the user selects a doctor
    const doctorDropdown = document.getElementById('doctorSelect');
    doctorDropdown.addEventListener('change', function () {
        chosenDoctorAddress = this.value; // Retrieve the selected doctor's address
        console.log('Chosen Doctor Address:', chosenDoctorAddress);

        populatePatients();
    });
}

// Function to populate patient list based on selected doctor
async function populatePatients() {
    const patients = await contract.methods.getAllPatients().call();
    const patientSelect = document.getElementById('patientSelect');
    patientSelect.innerHTML = '<option value="">Select Patient</option>';
    patients.forEach((patient, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = patient.name;
        patientSelect.appendChild(option);
    });

    const patientDropdown = document.getElementById('patientSelect');
    patientDropdown.addEventListener('change', function () {
        displayPatientDetails();
        loadMedicines();
    });
}

// Function to display patient details

async function displayPatientDetails() {
    const patientId = document.getElementById('patientSelect').value;
    //const [name, age, diseases] = await contract.methods.viewPatientData(patientId).call();
    const patientData = await contract.methods.viewPatientData(patientId).call();
    console.log(patientData);
    const name = patientData[0];
    const age = patientData[1];
    const diseases = patientData[2] || ''; // Use default value if diseases is empty
    const meds = await getPrescribedMedicine(patientId);

    document.getElementById('patientName').textContent = name;
    document.getElementById('patientAge').textContent = age;
    document.getElementById('patientDiseases').textContent = diseases;
    document.getElementById('patientMeds').textContent = meds.length>0?meds:'-';
    document.getElementById('patientDetails').style.display = 'block';
    document.getElementById('addDiseaseForm').style.display = 'block';
    document.getElementById('prescribeMedicineForm').style.display = 'block';
}

// Function to add disease to patient
async function addDisease() {
    const patientId = document.getElementById('patientSelect').value;
    const disease = document.getElementById('diseaseInput').value;
    // Check if the sender is a registered doctor
    const isDoctor = await contract.methods.doctors(chosenDoctorAddress).call({ from: contractAdmin });
    if (!isDoctor) {
        alert('Only registered doctors can add disease.');
        return;
    }
    await contract.methods.addPatientsDisease(patientId, disease).send({ from: contractAdmin });
    alert('Disease added successfully!');
}

async function loadMedicines() {
    const medicineList = document.getElementById('medicineList');
    medicineList.innerHTML = ''; // Clear previous options

    try {
        const medicines = await contract.methods.getMedicineList().call();
        medicines.forEach(medicine => {
            const option = document.createElement('option');
            option.text = `${medicine.name} (ID: ${medicine.id})`;
            option.value = medicine.id;
            medicineList.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading medicine list:', error);
    }
}

// Function to prescribe medicine to patient
async function prescribeMedicine() {
    const patientId = document.getElementById('patientSelect').value;
    const medicineId = document.getElementById('medicineList').value;
    // Check if the sender is a registered doctor
    const isDoctor = await contract.methods.doctors(chosenDoctorAddress).call({ from: chosenDoctorAddress });
    if (!isDoctor) {
        alert('Only registered doctors can add disease.');
        return;
    }
    await contract.methods.prescribeMedicine(patientId, medicineId).send({ from: chosenDoctorAddress });
    alert('Medicine prescribed successfully!');
    displayMedicineDetails(medicineId);
}

function displayMedicineDetails(medicineId) {
    const medicineDetailsDiv = document.getElementById('medicineDetails');
    const medicineNameSpan = document.getElementById('medicineName');
    const medicineExpirySpan = document.getElementById('medicineExpiry');
    const medicineDoseSpan = document.getElementById('medicineDose');
    const medicinePriceSpan = document.getElementById('medicinePrice');

    // Fetch medicine details from the contract
    contract.methods.viewMedicineDetails(medicineId).call()
        .then(medicine => {
            console.log(medicine);
            medicineNameSpan.textContent = medicine[0];
            medicineExpirySpan.textContent = new Date(medicine[1] * 1000).toLocaleDateString();
            medicineDoseSpan.textContent = medicine[2];
            medicinePriceSpan.textContent = `${medicine[3]} ETH`;
            // Show the medicine details div
            medicineDetailsDiv.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching medicine details:', error);
            // Hide the medicine details div if there is an error
            medicineDetailsDiv.style.display = 'none';
        });
}

async function getPrescribedMedicine(patientId) {
    try {
        const prescribedMedicineIds = await contract.methods.viewPrescribedMedicine(patientId).call();
        if (prescribedMedicineIds.length > 0) {
            const prescribedMedicineNames = [];
            for (const medId of prescribedMedicineIds) {
                const medicineDetails = await contract.methods.viewMedicineDetails(medId).call();
                const medicineName = medicineDetails[0];
                prescribedMedicineNames.push(medicineName);
            }
            console.log('Patient has been prescribed medicines with names:', prescribedMedicineNames);
            return prescribedMedicineNames;
        } else {
            console.log('Patient has not been prescribed any medicine.');
            return [];
        }
    } catch (error) {
        console.error('Error getting prescribed medicine names:', error);
        return [];
    }
}

// Function to add doctor
async function addDoctor() {
    const doctorName = document.getElementById('doctorName').value;
    const qualification = document.getElementById('qualification').value;
    const address = document.getElementById('address').value;
    console.log(doctorName + " " + qualification + " " + address);
    //await contract.methods.registerDoctor(doctorName, qualification, address).send({ from: contractAdmin });

    contract.methods.registerDoctor(doctorName, qualification, address)
        .estimateGas({ from: contractAdmin })
        .then((gasEstimate) => {
            console.log(gasEstimate);
            // Send the transaction with a higher gas limit than the estimate
            contract.methods.registerDoctor(doctorName, qualification, address)
                .send({ from: contractAdmin, gas: gasEstimate * 1 })
                .then((tx) => {
                    console.log("Transaction successful:", tx);
                    alert('Doctor added successfully!');
                })
                .catch((error) => {
                    console.error("Transaction error:", error);
                });
        })
        .catch((error) => {
            console.error("Gas estimation error:", error);
        });
}

// Function to add patient
async function addPatient() {
    const patientName = document.getElementById('patientName').value;
    const age = document.getElementById('age').value;
    //await contract.methods.registerPatient(patientName, age).send({ from: contractAdmin });

    contract.methods.registerPatient(patientName, age)
        .estimateGas({ from: contractAdmin })
        .then((gasEstimate) => {
            console.log(gasEstimate);
            // Send the transaction with a higher gas limit than the estimate
            contract.methods.registerPatient(patientName, age)
                .send({ from: contractAdmin, gas: gasEstimate * 1 })
                .then((tx) => {
                    console.log("Transaction successful:", tx);
                    alert('Patient added successfully!');
                })
                .catch((error) => {
                    console.error("Transaction error:", error);
                });
        })
        .catch((error) => {
            console.error("Gas estimation error:", error);
        });
}

// Function to add medicine
async function addMedicine() {
    const medicineName = document.getElementById('medicineName').value;
    const expiryDate = document.getElementById('expiryDate').valueAsNumber / 1000; // Convert to Unix timestamp
    const dose = document.getElementById('dose').value;
    const price = document.getElementById('price').value;
    const id = new Date().getTime(); // Generate unique ID
    //await contract.methods.addMedicine(id, medicineName, expiryDate, dose, price).send({ from: contractAdmin });

    contract.methods.addMedicine(medicineName, expiryDate, dose, price)
        .estimateGas({ from: contractAdmin })
        .then((gasEstimate) => {
            console.log(gasEstimate);
            // Send the transaction with a higher gas limit than the estimate
            contract.methods.addMedicine(medicineName, expiryDate, dose, price)
                .send({ from: contractAdmin, gas: gasEstimate * 1 })
                .then((tx) => {
                    console.log("Transaction successful:", tx);
                    alert('Medicine added successfully!');
                })
                .catch((error) => {
                    console.error("Transaction error:", error);
                });
        })
        .catch((error) => {
            console.error("Gas estimation error:", error);
        });
}