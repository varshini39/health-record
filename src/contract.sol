// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

pragma experimental ABIEncoderV2;

contract HealthRecords {

    address public contractOwner;
    
    struct Doctor {
        string name;
        string qualification;
        address workPlace;
    }

    struct Patient {
        string name;
        uint age;
        string diseases;
    }

    struct Medicine {
        uint id;
        string name;
        uint expiryDate;
        string dose;
        uint price;
    }

    mapping(address => Doctor) public doctors;
    mapping(uint => Patient) public patients;
    mapping(uint => Medicine) public medicines;
    mapping(uint => uint[]) public patientPrescriptions;
    uint patientCount;
    uint doctorCount;
    address[] public doctorAddresses;

    constructor() {
        contractOwner = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == contractOwner, "Only contractOwner can call this function");
        _;
    }

    modifier onlyDoctors() {
        require(doctors[msg.sender].workPlace == msg.sender, "Only doctors can call this function");
        _;
    }

    event DoctorRegistered(address indexed doctorAddress, string name, string qualification, address workPlace);
    event PatientRegistered(uint indexed patientId, string name, uint age);
    event DiseaseAdded(uint indexed patientId, string disease);
    event MedicineAdded(uint indexed id, string name, uint expiryDate, string dose, uint price);
    event MedicinePrescribed(uint indexed patientId, uint indexed medicineId);
    event PatientDetailsUpdated(uint indexed patientId, uint newAge);
   
    function registerDoctor(string memory _name, string memory _qualification, address _workPlace) onlyAdmin public {
        doctors[_workPlace] = Doctor(_name, _qualification, _workPlace);
        doctorAddresses.push(_workPlace);
        doctorCount++;
        emit DoctorRegistered(_workPlace, _name, _qualification, _workPlace);
    }

    function registerPatient(string memory _name, uint _age) public {
        patientCount++;
        patients[patientCount] = Patient(_name, _age, "");
        emit PatientRegistered(patientCount, _name, _age);
    }

    function addPatientsDisease(uint _patid, string memory _disease) public {
        patients[_patid].diseases = _disease;
        emit DiseaseAdded(_patid, _disease);
    }

    function addMedicine(uint _id, string memory _name, uint _expiryDate, string memory _dose, uint _price) public {
        medicines[_id] = Medicine(_id, _name, _expiryDate, _dose, _price);
        emit MedicineAdded(_id, _name, _expiryDate, _dose, _price);
    }

    function prescribeMedicine(uint _patid, uint _medid) public onlyDoctors {
        require(patients[_patid].age > 0, "Patient not found.");
        patientPrescriptions[_patid].push(_medid);
        emit MedicinePrescribed(_patid, _medid);
    }

    function updatePatientDetails(uint _patid, uint _age) public {
        patients[_patid].age = _age;
        emit PatientDetailsUpdated(_patid, _age);
    }

    function viewPatientData(uint _patient) public view returns (uint, uint, string memory, string memory) {
        return (patients[_patient].age, patients[_patient].age, patients[_patient].name, patients[_patient].diseases);
    }

    function viewMedicineDetails(uint _id) public view returns (string memory, uint, string memory, uint) {
        return (medicines[_id].name, medicines[_id].expiryDate, medicines[_id].dose, medicines[_id].price);
    }

    function viewPatientDataByDoctor(uint _patient) public view onlyDoctors returns (uint, uint, string memory, string memory) {
        return viewPatientData(_patient);
    }

    function viewPrescribedMedicine(uint _patient) public view onlyDoctors returns (uint[] memory) {
        return patientPrescriptions[_patient];
    }

    function viewDoctorDetails(address _doctor) public view returns (string memory, string memory, address) {
        Doctor storage doctor = doctors[_doctor];
        return (doctor.name, doctor.qualification, doctor.workPlace);
    }

    // Function to fetch all patients' details
    function getAllPatients() public view returns (Patient[] memory) {
        Patient[] memory allPatients = new Patient[](patientCount);
        for (uint i = 1; i <= patientCount; i++) {
            allPatients[i - 1] = patients[i];
        }
        return allPatients;
    }

    function getAllDoctors() public view returns (Doctor[] memory) {
        Doctor[] memory allDoctors = new Doctor[](doctorAddresses.length);
        for (uint i = 0; i < doctorAddresses.length; i++) {
            address doctorAddress = doctorAddresses[i];
            Doctor storage doctor = doctors[doctorAddress];
            allDoctors[i] = doctor;
        }
        return allDoctors;
    }
}