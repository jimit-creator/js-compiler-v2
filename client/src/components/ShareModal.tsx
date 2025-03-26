import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FacebookIcon, 
  LinkedinIcon, 
  TwitterIcon 
} from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

export default function ShareModal({ isOpen, onClose, code }: ShareModalProps) {
  const [title, setTitle] = useState("My JavaScript Code");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Create a mutation for saving the code
  const saveCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/snippets', {
        code,
        title,
        language: 'javascript'
      });
      return response.json();
    },
    onSuccess: (data) => {
      const link = `${window.location.origin}/s/${data.shareId}`;
      setShareLink(link);
      toast({
        title: "Code shared successfully!",
        description: "Your code has been saved and can be accessed via the share link.",
      });
      navigate(`/s/${data.shareId}`);
    },
    onError: () => {
      toast({
        title: "Failed to share code",
        description: "There was an error while trying to share your code.",
        variant: "destructive",
      });
    }
  });

  const handleSaveAndShare = () => {
    if (!code.trim()) {
      toast({
        title: "Cannot share empty code",
        description: "Please write some code before sharing.",
        variant: "destructive",
      });
      return;
    }
    
    saveCodeMutation.mutate();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Share link has been copied to your clipboard.",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const shareToSocial = (platform: string) => {
    let url = '';
    const text = encodeURIComponent(`Check out my JavaScript code: ${title}`);
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${text}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
        break;
    }
    
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Code</DialogTitle>
          <DialogDescription>
            Share your code with others via a link or on social media.
          </DialogDescription>
        </DialogHeader>
        
        {!shareLink ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter a title for your code"
              />
            </div>
            
            <Button 
              onClick={handleSaveAndShare} 
              className="w-full"
              disabled={saveCodeMutation.isPending}
            >
              {saveCodeMutation.isPending ? "Saving..." : "Save & Generate Share Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="share-link">Share Link</Label>
              <div className="flex">
                <Input 
                  id="share-link"
                  value={shareLink}
                  readOnly
                  className="rounded-r-none"
                />
                <Button 
                  className="rounded-l-none"
                  onClick={copyToClipboard}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Share on Social Media</Label>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full" 
                  onClick={() => shareToSocial('facebook')}
                >
                  <FacebookIcon className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-sky-500 hover:bg-sky-600 text-white rounded-full" 
                  onClick={() => shareToSocial('twitter')}
                >
                  <TwitterIcon className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-blue-700 hover:bg-blue-800 text-white rounded-full" 
                  onClick={() => shareToSocial('linkedin')}
                >
                  <LinkedinIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed Code</Label>
              <Textarea 
                id="embed-code" 
                readOnly 
                value={`<iframe src="${window.location.origin}/embed/${shareLink.split('/').pop()}" width="100%" height="400" frameborder="0"></iframe>`}
                className="font-mono text-sm"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
