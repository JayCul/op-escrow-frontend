import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (proofURI: string, description?: string) => void;
  isLoading?: boolean;
}

export const UploadProofModal: React.FC<UploadProofModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isLoading = false,
}) => {
  const [proofURI, setProofURI] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proofURI.trim()) {
      onUpload(proofURI.trim(), description.trim() || undefined);
      setProofURI("");
      setDescription("");
    }
  };

  const handleClose = () => {
    setProofURI("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Proof of Shipment"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Proof URI *</label>
          <Input
            placeholder="IPFS hash, Arweave hash, or tracking number..."
            value={proofURI}
            onChange={(e) => setProofURI(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter a proof identifier like IPFS hash (Qm...), Arweave transaction
            ID, or tracking number
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Description (Optional)
          </label>
          <Textarea
            placeholder="Additional details about the shipment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!proofURI.trim() || isLoading}
            isLoading={isLoading}
          >
            Upload Proof
          </Button>
        </div>
      </form>
    </Modal>
  );
};
