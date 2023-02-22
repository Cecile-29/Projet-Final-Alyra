import { Text, Input, Button, useToast, OrderedList } from '@chakra-ui/react';
import { useAccount, useProvider, useSigner } from 'wagmi'
import Contract from "../VolunteersNetwork.json"
import { useState } from "react";
import { ethers } from 'ethers'



const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const Owner = () => {
  const [volunteerAddress, setVolunteerAddress] = useState("");
  const [events, setEvents] = useState([]);
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const toast = useToast();

  async function addVolunteer(event) {
    event.preventDefault();
    if (!isConnected) {
      toast({
        status: "error",
        title: "Please connect to a wallet to add a volunteer",
      });
      return;
    }

    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer);

      const tx = await contract.addVolunteerByOwner(volunteerAddress);
      await tx.wait();

      toast({
        status: "success",
        title: "Volunteer added successfully",
      });

      const filter = contract.filters.VolunteerRegistered();
      const events = await contract.queryFilter(filter);

      setEvents(events);
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Error adding volunteer",
      });
    }
  }

  const formattedEvents = events.map((event) => {
    return (
      <Text key={event.transactionHash}>
        <p>Volunteer address: {event.args.volunteerAddress}</p>
        <p>ID: {event.args.id.toString()}</p>
      </Text>
    );
  });

  return (

    <>
      <form onSubmit={addVolunteer}>
        <Input type="text" variant='outline' placeholder='Enter a volunteer valid address' value={volunteerAddress} onChange={(e) => setVolunteerAddress(e.target.value)} />
        <Button colorScheme='twitter' type="submit">ADD</Button>
      </form>
      {formattedEvents.length > 0 ? (
        <OrderedList>
          {formattedEvents}
        </OrderedList>
      ) : (
        <Text>No volunteers added yet.</Text>
      )}
    </>

  );
}
