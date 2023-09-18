// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract FileStorage {
    // Event
    event FileUploaded(
        uint256 fileId,
        string fileHash,
        uint256 fileSize,
        string fileType,
        string fileName,
        uint256 uploadTime,
        address uploader
    );

    // Event
    event FileRemoved(
        uint256 fileId,
        address uploader
    );

    // File Struct
    struct File {
        uint256 fileId;
        string fileHash;
        uint256 fileSize;
        string fileType;
        string fileName;
        uint256 uploadTime;
        address uploader;
    }

    uint256 public fileCount = 0;
    mapping(address => File[]) public files;

    // Upload File function
    function uploadFile(
        string memory _fileHash,
        uint256 _fileSize,
        string memory _fileType,
        string memory _fileName
    ) public {
        require(bytes(_fileHash).length > 0);
        require(bytes(_fileType).length > 0);
        require(bytes(_fileName).length > 0);
        require(msg.sender != address(0));
        require(_fileSize > 0);

        fileCount++;

        files[msg.sender].push(File(
            fileCount,
            _fileHash,
            _fileSize,
            _fileType,
            _fileName,
            block.timestamp,
            msg.sender
        ));

        emit FileUploaded(
            fileCount,
            _fileHash,
            _fileSize,
            _fileType,
            _fileName,
            block.timestamp,
            msg.sender
        );
    }

    // Remove File function
    function removeFile(uint256 index) public {
        require(index >= 0 && index < files[msg.sender].length, "Invalid file index");
        
        uint256 lastIndex = files[msg.sender].length - 1;

        if (index != lastIndex) {
            File storage lastFile = files[msg.sender][lastIndex];
            File storage fileToRemove = files[msg.sender][index];

            lastFile.fileId = fileToRemove.fileId;
            lastFile.fileHash = fileToRemove.fileHash;
            lastFile.fileSize = fileToRemove.fileSize;
            lastFile.fileType = fileToRemove.fileType;
            lastFile.fileName = fileToRemove.fileName;
            lastFile.uploadTime = fileToRemove.uploadTime;
            lastFile.uploader = fileToRemove.uploader;
        }

        files[msg.sender].pop();

        fileCount--;

        emit FileRemoved(index, msg.sender);
    }
}