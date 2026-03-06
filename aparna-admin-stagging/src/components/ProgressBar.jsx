import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import errorImg from '../../src/images/error-message.png'
import uploading from '../../src/images/hourglass.gif'

const ProgressBar = ({
  progressMessages,
  handleProcessCompletion,
  totalMessageStatus,
  response,
  modelTitle
}) => {
  const [displayedMessages, setDisplayedMessages] = useState([])
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (progressMessages && progressMessages.length > 0) {
      setDisplayedMessages(progressMessages.slice(0, messageIndex + 1))
    }
  }, [progressMessages, messageIndex])

  useEffect(() => {
    if (progressMessages && progressMessages?.length > 0) {
      const timer = setTimeout(() => {
        if (messageIndex < progressMessages?.length) {
          setMessageIndex((prevIndex) => prevIndex + 1)
        }
      }, 30)

      return () => clearTimeout(timer)
    }
  }, [progressMessages, messageIndex])

  const progress = (
    (displayedMessages?.length * 100) /
    totalMessageStatus
  )?.toFixed()

  const getMessageColor = (messageText) => {
    if (messageText?.toLowerCase()?.includes('successfully')) {
      return 'text-success p-1'
    } else if (
      ['uploading', 'verifying', 'updating'].some((word) =>
        messageText?.toLowerCase()?.includes(word)
      )
    ) {
      return 'text-primary p-1'
    } else {
      return 'text-danger p-1'
    }
  }

  return (
    <div className="progress-overlay">
      <div className="card">
        <div
          className="card-body"
          style={{
            paddingBottom: '15px',
            // height: 'calc(100vh - 10rem)',
            overflow: 'auto'
          }}
        >
          <h3 className="text-center">{modelTitle}</h3>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-info">{progress}%</div>
          <div
            className="progress-note"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}
          >
            {displayedMessages
              ?.filter(
                (mess, index) =>
                  ['not verified', 'successfully']?.some((word) =>
                    mess?.toLowerCase()?.includes(word)
                  ) ||
                  (['uploading', 'verifying', 'updating'].some((word) =>
                    mess?.toLowerCase()?.includes(word)
                  ) &&
                    displayedMessages?.length === index + 1)
              )
              .map((messageText, index) => (
                <div
                  key={index}
                  className={`text-left ${getMessageColor(messageText)}`}
                >
                  <span>
                    {messageText?.toLowerCase()?.includes('successfully') ? (
                      <>✓ </>
                    ) : ['uploading', 'verifying', 'updating'].some((word) =>
                        messageText?.toLowerCase()?.includes(word)
                      ) ? (
                      <img src={uploading} height={20} width={20} alt="" />
                    ) : (
                      <>✘ </>
                    )}
                  </span>
                  <span> {messageText}</span>
                </div>
              ))}
          </div>
          {(displayedMessages?.includes('Product Sheet not Verified...') ||
            response?.data?.code !== 200) && (
            <>
              {response?.data?.data?.map((error, index) => (
                <div
                  style={{
                    color: 'red',
                    fontSize: '13px',
                    fontWeight: '600',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '8px',
                    wordBreak: 'break-all'
                  }}
                >
                  <img src={errorImg} width={16} height={16} alt="" /> {error}
                </div>
              ))}
            </>
          )}
          {response?.data?.code && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '15px',
                position: 'sticky',
                bottom: '-15px',
                background: 'white',
                paddingBlock: '10px'
              }}
            >
              <Button
                onClick={() => {
                  handleProcessCompletion()
                }}
                className="btn btn-warning "
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressBar
