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

async function initializeContract() {
    const ganacheProvider = 'http://127.0.0.1:7545';
    const web3 = new Web3(ganacheProvider);
    const contractABI = await loadContractABI();

    // Define the address of the deployed Solidity contract
    const contractAddress = '0x3531112261da9674e131630566998f7967dc3533';
    
    // Create a contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Fetch all patients
    contract.methods.getAllPatients().call((error, patients) => {
        if (error) {
            console.error('Error fetching patients:', error);
        } else {
            console.log('Patients:', patients);
            // Display patients in your application UI
            document.getElementById('patients').innerHTML = JSON.stringify(patients);
        }
    });

    // Fetch all doctors
    contract.methods.getAllDoctors().call((error, doctors) => {
        if (error) {
            console.error('Error fetching doctors:', error);
        } else {
            console.log('Doctors:', doctors);
            // Display doctors in your application UI
            document.getElementById('doctors').innerHTML = JSON.stringify(doctors);
        }
    });
}