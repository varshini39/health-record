// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.8.20;

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
        uint uuid;
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
    uint medicineCount;
    address[] public doctorAddresses;
    uint[] public patientUuids;

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
    event PatientRegistered(uint indexed uuid, string name, uint age);
    event DiseaseAdded(uint indexed uuid, string disease);
    event MedicineAdded(uint indexed id, string name, uint expiryDate, string dose, uint price);
    event MedicinePrescribed(uint indexed uuid, uint indexed medicineId);
    event PatientDetailsUpdated(uint indexed uuid, uint newAge);
   
    function registerDoctor(string memory _name, string memory _qualification, address _workPlace) onlyAdmin public {
        doctors[_workPlace] = Doctor(_name, _qualification, _workPlace);
        doctorAddresses.push(_workPlace);
        doctorCount++;
        emit DoctorRegistered(_workPlace, _name, _qualification, _workPlace);
    }

    function registerPatient(string memory _name, uint _age, uint _uuid) public {
        patients[_uuid] = Patient(_name, _age, "", _uuid);
        patientUuids.push(_uuid);
        patientCount++;
        emit PatientRegistered(_uuid, _name, _age);
    }

    function addPatientsDisease(uint _uuid, string memory _disease) public {
        patients[_uuid].diseases = _disease;
        emit DiseaseAdded(_uuid, _disease);
    }

    function addMedicine(string memory _name, uint _expiryDate, string memory _dose, uint _price) public {
        medicineCount++;
        medicines[medicineCount] = Medicine(medicineCount, _name, _expiryDate, _dose, _price);
        emit MedicineAdded(medicineCount, _name, _expiryDate, _dose, _price);
    }

    function prescribeMedicine(uint _uuid, uint _medid) public onlyDoctors {
        require(patients[_uuid].age > 0, "Patient not found.");
        // Check if the medicine ID is not already prescribed
        for (uint i = 0; i < patientPrescriptions[_uuid].length; i++) {
            require(patientPrescriptions[_uuid][i] != _medid, "Medicine already prescribed to the patient.");
        }
        patientPrescriptions[_uuid].push(_medid);
        emit MedicinePrescribed(_uuid, _medid);
    }

    function updatePatientDetails(uint _uuid, uint _age) public {
        patients[_uuid].age = _age;
        emit PatientDetailsUpdated(_uuid, _age);
    }

    function viewPatientData(uint _uuid) public view returns (string memory, uint, string memory) {
        return (patients[_uuid].name, patients[_uuid].age, patients[_uuid].diseases);
    }

    function viewMedicineDetails(uint _id) public view returns (string memory, uint, string memory, uint) {
        return (medicines[_id].name, medicines[_id].expiryDate, medicines[_id].dose, medicines[_id].price);
    }

    function viewPrescribedMedicine(uint _uuid) public view onlyDoctors returns (uint[] memory) {
        return patientPrescriptions[_uuid];
    }

    function viewDoctorDetails(address _doctor) public view returns (string memory, string memory, address) {
        Doctor storage doctor = doctors[_doctor];
        return (doctor.name, doctor.qualification, doctor.workPlace);
    }

    // Function to fetch all patients' details
    function getAllPatients() public view returns (Patient[] memory) {
        Patient[] memory allPatients = new Patient[](patientUuids.length);
        for (uint i = 0; i < patientUuids.length; i++) {
            uint patUuid = patientUuids[i];
            Patient storage patient = patients[patUuid];
            allPatients[i] = patient;
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

    function getMedicineList() public view returns (Medicine[] memory) {
        Medicine[] memory allMedicines = new Medicine[](medicineCount);
        for (uint i = 1; i <= medicineCount; i++) {
            allMedicines[i - 1] = medicines[i];
        }
        return allMedicines;
    }
}