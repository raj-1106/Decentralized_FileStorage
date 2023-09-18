import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Web3Storage } from "web3.storage";
import { useAccount, useContract, useSigner } from "wagmi";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

const client = new Web3Storage({
	token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU5ODUxNUU2YzEzOUFBMkZEZTM5QmYxNUVBMzFCQjhlRkE5RjhBNGYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzA2NzE5NjIzMzMsIm5hbWUiOiJGaWxlU3RvcmFnZSJ9.8tflQ5CemOAltI9sQo2YUJvNLPgI8u58HeBFRbTMCtw",
});

function App() {
	const [files, setFiles] = useState([]);
	const [file, setFile] = useState(null);
	const [fileName, setFileName] = useState("");
	const [fileSize, setFileSize] = useState("");
	const [fileType, setFileType] = useState("");

	const { address } = useAccount();
	const { data: signer } = useSigner();
	const contract = useContract({
		address: CONTRACT_ADDRESS,
		abi: CONTRACT_ABI,
		signerOrProvider: signer,
	});

	const captureFile = async (e) => {
		try {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);
			setFileName(selectedFile.name);
			setFileSize(selectedFile.size);
			setFileType(selectedFile.type);
		} catch (err) {
			console.log(err);
		}
	};

	const uploadFile = async (e) => {
		e.preventDefault();
		console.log("UPLOADINGGG");
		if (file) {
			try {
				const formData = new FormData();
				formData.append("file", file);
	
				// Upload the file to Web3.Storage
				const uploadResponse = await fetch("https://api.web3.storage/upload", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${client.token}`,
					},
					body: formData,
				});
	
				if (!uploadResponse.ok) {
					throw new Error("Failed to upload file to Web3.Storage");
				}
	
				const uploadedFile = await uploadResponse.json();
	
				const uploadTxn = await contract.uploadFile(
					uploadedFile.cid,
					fileSize.toString(),
					fileType,
					fileName
				);
				await uploadTxn.wait();
	
				setFile(null);
				setFileName("");
				setFileSize("");
				setFileType("");
	
				getFilesUploaded();
			} catch (err) {
				console.log(err);
			}
		} else {
			console.log("No file selected.");
		}
	};
	

	const removeFile = async (index) => {
		try {
			const removeTxn = await contract.removeFile(index);
			await removeTxn.wait();

			const updatedFiles = files.filter((_, i) => i !== index);
			setFiles(updatedFiles);
		} catch (err) {
			console.log(err);
		}
	};

	const getFilesUploaded = async () => {
		try {
			const fileCount = await contract.fileCount();

			const filesArr = [];
			for (let i = 0; i < fileCount.toNumber(); i++) {
				const file = await contract.files(address, i);
				const file_obj = {
					id: file.fileId.toNumber(),
					hash: file.fileHash,
					size: file.fileSize.toNumber(),
					type: file.fileType,
					name: file.fileName,
					uploadTime: file.uploadTime.toNumber(),
				};
				filesArr.push(file_obj);
			}
			setFiles(filesArr);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (contract) {
			getFilesUploaded();
		}
	}, [contract]);

	return (
		<div className="bg-black text-white">
			<div className="flex items-center justify-between flex-row px-4 py-2">
				<h1 className="text-2xl font-bold">FileStorage</h1>
				<ConnectButton />
			</div>
			<div className="flex flex-col items-center justify-center min-h-screen">
				<h1 className="text-4xl font-extrabold">Upload files</h1>

				{address && (
					<div className="flex flex-col items-center justify-center mb-8 mt-6">
						<form onSubmit={uploadFile} className="px-4">
							<div className="mt-4 flex justify-between mx-4">
								<input
									className="hidden"
									type="file"
									id="filecap"
									onChange={captureFile}
								/>
								<label
									htmlFor="filecap"
									className="cursor-pointer bg-white hover:bg-blue-500 text-blue-700 hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded font-bold dark:bg-gray-700 dark:text-gray-100 dark:border-gray-900 transform transition hover:scale-110"
								>
									{fileName ? fileName : "Choose a file"}
								</label>
								<button
									type="submit"
									className="py-2 px-4 rounded font-bold bg-white text-blue-700 border border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-900 hover:border-transparent hover:bg-blue-500 hover:text-white transform transition hover:scale-110"
								>
									Upload!
								</button>
							</div>
						</form>
						<div className="flex flex-col mx-6 my-8">
							<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
								<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
									<div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg dark:border-black">
										<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
											<thead className="bg-gray-50 dark:bg-blue-opaque">
												<tr className="border-b dark:border-gray-600">
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														ID
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Name
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Type
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Size
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Date
													</th>
													<th
														scope="col"
														className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
													>
														Hash/View/Remove
													</th>
												</tr>
											</thead>
											<tbody className="bg-white dark:bg-blue-opaque divide-y divide-gray-200">
												{files.map((file, index) => (
													<tr key={index}>
														<td className="px-4 py-4 whitespace-nowrap">
															<div className="text-sm font-medium text-gray-900">
																{file.id}
															</div>
														</td>
														<td className="px-4 py-4 whitespace-nowrap">
															<div className="text-sm text-gray-900">
																{file.name}
															</div>
														</td>
														<td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
															{file.type}
														</td>
														<td className="px-4 py-4 whitespace-nowrap">
															<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-pink-100 dark:text-pink-800">
																{file.size} bytes
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{new Date(file.uploadTime * 1000).toLocaleString()}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
															<a
																href={`https://ipfs.io/ipfs/${file.hash}`}
																className="text-indigo-600 hover:text-indigo-900 dark:text-purple-400 dark:hover:text-purple-700"
																rel="noopener noreferrer"
																target="_blank"
															>
																View
															</a>{" "}
															/{" "}
															<button
																className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-700"
																onClick={() => removeFile(index)}
															>
																Remove
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;