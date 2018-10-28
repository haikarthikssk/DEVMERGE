
pragma solidity ^0.4.21;
import "installed_contracts/oraclize-api/contracts/usingOraclize.sol";

contract OraclizeTest is usingOraclize {

    address owner;

    struct X509{
        string hostname;
        string publicKey;
        address revokeKey;
        bool verified;
    }
    mapping (bytes32 => string) queries;
    mapping(string => X509) certificates;

    event LogInfo(string description);
    event VerificationResult(string res_type, string message, string result, string hostname);

    // Constructor
    function OraclizeTest()
    payable
    public {
        owner = msg.sender;

        OAR = OraclizeAddrResolverI(0x6f485c8bf6fc43ea212e93bbf8ce046c7f1cb475);

        oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
    }

    // Fallback function
    function()
    public{
        revert();
    }

    function __callback(bytes32 id, string result, bytes proof)
    public {

        require(msg.sender == oraclize_cbAddress());

        string hostname = queries[id];
        X509 Certificate = certificates[hostname];

        if(strCompare(result, Certificate.publicKey) == 0){
            
        Certificate.verified = true;
        emit VerificationResult("verified", "success", result, hostname);
        
        }
        else{

            emit VerificationResult("notverified", "failure", result, hostname);
            delete certificates[hostname];
        }
    }


    function isVerified(string hostname) payable public returns (string)
     {
         if(certificates[hostname].verified){
            emit VerificationResult("isverified", "success", certificates[hostname].publicKey, hostname);  
             return certificates[hostname].publicKey;   
         }
        emit VerificationResult("isnotverified", "failure", "", hostname);  
        return certificates[hostname].publicKey;
    }


    function revoke(string hostname) payable public returns(bool){
         X509 Certificate = certificates[hostname];
            if(Certificate.revokeKey == msg.sender){
             delete certificates[hostname];
              emit VerificationResult("revoke", "success", "", hostname);  
             return true;
         }
         else{
             return false;
         }
    }

    function verifyhost(string hostname, string publicKey)
    payable
    public
    {
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit LogInfo("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit LogInfo("Oraclize query was sent, standing by for the answer..");

            //oraclize_query("URL",  strConcat("json(", hostname, ").key"));
            if(certificates[hostname].verified == true){
                 emit VerificationResult("alreadyverified", "success", certificates[hostname].publicKey, hostname);  
            }
            else{
                queries[oraclize_query("URL",  strConcat("json(https://", hostname, "/identity).key"))] = hostname;
                certificates[hostname] = X509(hostname, publicKey, msg.sender, false);
            }

        }
    }
    
//     function toString(address x) returns (string) {
//     bytes memory b = new bytes(20);
//     for (uint i = 0; i < 20; i++)
//         b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
//     return string(b);
// }
}