export interface ApprovalRequest {
  id: string;
  origin: string;
  type: string;
  metadata: Record<string, any>;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}
