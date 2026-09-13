# Health Record

A blockchain-based health records system. A Solidity smart contract stores doctors, patients, medicines, and prescriptions, with three static web front ends (admin, doctor, patient) that talk to the contract via web3.js.

## Structure

- `src/contract.sol` — the `HealthRecords` smart contract: registers doctors and patients, records diseases, manages a medicine catalog, and links prescriptions to patients.
- `src/app.js` — shared front-end logic. Loads the contract ABI, connects to a local blockchain via web3.js, and drives all three web pages.
- `webapps/admin.html` — admin console for registering doctors, patients, and medicines.
- `webapps/doctor.html` — doctor view for selecting a patient, adding diagnoses, and prescribing medicine.
- `webapps/patient.html` — patient view for looking up your own record and prescriptions by UUID.
- `css/` — stylesheets for each page (`admin.css`, `doctor.css`, `patient.css`).
- `configurations/contractABI.json` — the deployed contract's ABI, fetched at runtime by `app.js`.

## Contract overview

`HealthRecords` (`src/contract.sol`) tracks:

- **Doctors** — name, qualification, and workplace address; only the contract owner (admin) can register a doctor.
- **Patients** — name, age, diseases, and a UUID.
- **Medicines** — name, expiry date, dose, and price.
- **Prescriptions** — medicine IDs linked to a patient's UUID; only registered doctors can prescribe.

## Running locally

1. Start a local blockchain (e.g. [Ganache](https://trufflesuite.com/ganache/)) on `http://127.0.0.1:7545`.
2. Deploy `src/contract.sol` to it, and update the contract address and admin address in `src/app.js` (`contractAddress`, `contractAdmin`) to match your deployment.
3. Export the deployed contract's ABI to `configurations/contractABI.json`.
4. Serve the project root with any static file server (needed for the ABI `fetch` call to work), e.g.:
   ```bash
   npx http-server .
   ```
5. Open `webapps/admin.html`, `webapps/doctor.html`, or `webapps/patient.html` in a browser, with a wallet (e.g. MetaMask) connected to the same network.

## Dependencies

- [web3.js](https://web3js.readthedocs.io/) (loaded via CDN in each HTML page; also listed in `package.json`)
