ne'
                      : 'bg-[#dcf8c6] text-gray-900 rounded-br-none'
                  }`}
                >
                  {message.content && (
                    <p className="text-sm whitespace-pre-wrap break-words mb-1">
                      {message.content}
                    </p>
                  )}
                  
                  <MessageMedia metadata={message.metadata} />
                  
                  <div className={`flex items-center justify-end gap-1 ${
                    isFromUser ? 'text-gray-600' : 'text-gray-500'
                  }`}>
                    <span className="text-[11px]">
                      {messageTime}
                    </span>
                    {isFromUser && (
                      <svg 
                        width="16" 
                        height="11" 
                        viewBox="0 0 16 11" 
                        fill="none" 
                        className="text-blue-500"
                      >
                        <path 
                          d="M11.071 0.5L5.5 6.071L2.929 3.5L0.5 5.929L5.5 10.929L13.5 2.929L11.071 0.5Z" 
                          fill="currentColor"
                        />
                        <path 
                          d="M15.071 0.5L9.5 6.071L8.793 5.364L6.364 7.793L9.5 10.929L17.5 2.929L15.071 0.5Z" 
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <form onSubmit={handleSendMessage} className="space-y-2 pt-4 border-t bg-white -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 16 * 1024 * 1024) {
                    toast({
                      title: "Arquivo muito grande",
                      description: "O arquivo deve ter no máximo 16MB",
                      variant: "destructive"
                    });
                    return;
                  }
                  setSelectedFile(file);
                }
              }}
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={sendMessageMutation.isPending}
              title="Anexar arquivo"
              data-testid="button-attach-file"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
              data-testid="input-message"
            />
            
            <Button
              type="submit"
              disabled={sendMessageMutation.isPending || (!newMessage.trim() && !selectedFile)}
              data-testid="button-send-message"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
