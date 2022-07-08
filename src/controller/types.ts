export interface ApprovalRequest {
  id: string;
  origin: string;
  type: string;
  metadata: any;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}
