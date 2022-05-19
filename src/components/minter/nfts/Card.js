import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack, Row } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";
import { useEffect, useState, useCallback } from "react";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";


  const NftCard = ({ nft, purchaseItem, isSold, isOwner, isForsale, toggleForsale, modifyPrice }) => {
  const { owner, price, image, description, name, index, attributes } = nft;
  const [newPrice, setnewPrice] = useState(0);
  const [show, setShow] = useState(false);
  

  // check if all form data has been filled
  const isFormFilled = () => newPrice;

  // close the popup modal
  const handleClose = () => {
    setShow(false);
    setnewPrice(0);
  };

  // display the popup modal
  const handleShow = () => setShow(true);

  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {index} ID
            </Badge>
            <Badge bg="secondary" className="ms-auto">
              {price / 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>
          <div>
            <Row className="mt-2">
              {attributes.map((attribute, key) => (
                <Col key={key}>
                  <div className="border rounded bg-light">
                    <div className="text-secondary fw-lighter small text-capitalize">
                      {attribute.trait_type}
                    </div>
                    <div className="text-secondary text-capitalize font-monospace">
                      {attribute.value}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {isSold ? (
            <div className="d-flex m-2 justify-content-center">
              <button
                className={`btn ${isOwner ? "btn-danger" : "btn-secondary"}`}
              >
                {isOwner ? "You bought this item" : "This item has been sold"}
              </button>

            </div>
          ) : (
            
            <div className="d-flex m-2 justify-content-center">
               
              <button  onClick={purchaseItem} className="btn btn-primary" >
                Buy
              </button>
            </div>
            
          )}

{isOwner ? (
            <div className="d-flex m-2 justify-content-center">
              <button onClick={toggleForsale} className= "btn btn-primary"
            >
               {isForsale ? "toggle not for sale" : "toggle for sale"} 
              </button>
              <div className="d-flex m-2 justify-content-center">
              <p>{isForsale ? "Your sneaker is set to forsale": "Your sneaker is set to not forsale"}</p>
              </div>
            </div>
          ) : (
            <div className="d-flex m-2 justify-content-center">
              <p>{isForsale ? "this item is for sale" : "this item is not forsale"}</p>
            </div>
          )}

       <div className="d-flex m-2 justify-content-center">
       <Button
        onClick={handleShow}
        className= "btn btn-primary"
      >
        Change price
      </Button>
      </div>

       {/* Modal */}
 <Modal show={show} onHide={handleClose} centered>
 <Modal.Header closeButton>
   <Modal.Title>Change Sneaker Price</Modal.Title>
 </Modal.Header>

 <Modal.Body>
   <Form>
   <FloatingLabel
              controlId="inputPrice"
              label="Price"
              className="mb-3"
            >
              <Form.Control
                as="textarea"
                placeholder="Price"
                style={{ height: "80px" }}
                onChange={(e) => {
                  setnewPrice(e.target.value);
                }}
              />
            </FloatingLabel>
   </Form>
 </Modal.Body>

 <Modal.Footer>
   <Button variant="outline-secondary" onClick={handleClose}>
     Close
   </Button>

   <Button
     variant="dark"
     disabled={!isFormFilled()}
     onClick = {() => {
       modifyPrice({
         newPrice,
         index
       });
       handleClose();
     }}
   >
     Save
   </Button>
 </Modal.Footer>
</Modal>


        </Card.Body>
      </Card>
    </Col>

  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
  modifyPrice: PropTypes.func.isRequired,

};

export default NftCard;
