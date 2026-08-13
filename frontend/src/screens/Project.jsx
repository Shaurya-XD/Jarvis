import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import axiosInstance from '../config/axios'; 
import { disconnectSocket, initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { useUserContext } from '../context/user.context';
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Editor from '@monaco-editor/react';
import { getWebContainer } from '../config/webContainer';

const Project = () => {
  const {user} = useUserContext();
  const location = useLocation();
  console.log(location.state);
  const [iFrameUrl, setiFrameUrl] = useState(null)
  const [runProcess, setRunProcess] = useState(null)

  const messageBox = useRef()
  const [allMessages, setAllMessages] = useState([])
  const [message, setMessage] = useState('')
  const [allUsers, setAllUsers] = useState([])
  const [currentFile, setCurrentFile] = useState(null)
  const [fileTree, setFileTree] = useState({})

  const [webContainer, setWebContainer] = useState(null)
  const serverReadyUnsubscribe = useRef(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [collaborators, setCollaborators] = useState(
    location.state.project.users || []
  );

  const isClicked = useRef(null);
  const sidePanel = useRef(null);

  const [users, setUsers] = useState([]);

  const projectId = location.state.project._id;

  const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

  const send = () => {
    const outgoingData = {
      message,
      sender: user._id,
      email: user.email
    }
    sendMessage('project-message', outgoingData)
    setMessage('');

    setAllMessages((prev) => [...prev, outgoingData]);
  }

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  useEffect(() => {
    let active = true;

    getWebContainer()
      .then((container) => {
        if (active) {
          setWebContainer(container);
          console.log("container started");
        }
      })
      .catch((error) => {
        console.error('Unable to boot WebContainer:', error);
      });

    initializeSocket(projectId);

    receiveMessage('user-joined', (data) => {
      setAllMessages(prev => [
        ...prev,
        {
          type: 'system',
          message: `${data.email} joined the room`
        }
      ]);
    });

    receiveMessage('user-left', (data) => {
      setAllMessages(prev => [
        ...prev,
        {
          type: 'system',
          message: `${data.email} left the room`
        }
      ]);
    });

    receiveMessage('project-message', async (data) => {
      let message = data.message;

      try {
        if (typeof message === 'string') {
          const match = message.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

          if (match) {
            message = match[1];
          }

          message = message.trim();
        }

        const parsedMessage = JSON.parse(message);

        if (parsedMessage.fileTree) {
          setFileTree(parsedMessage.fileTree);
          saveFileTree(parsedMessage.fileTree);

          const container = await getWebContainer();
          await container.mount(parsedMessage.fileTree);
        }

        setAllMessages(prev => [
          ...prev,
          {
            ...data,
            message: parsedMessage.text || ''
          }
        ]);
      } catch {
        // Not JSON, treat as normal chat message
        setAllMessages(prev => [
          ...prev,
          data
        ]);
      }
    });

    axiosInstance.get(`/projects/get-project/${projectId}`).then(res => {
        setFileTree(res.data.project.fileTree || {})
    })

    const fetchData = async() => {
      try{
        const response = await axiosInstance.get('/users/all');
        console.log(response.data.users);
        const fetchedUsers = response.data.users;
        setAllUsers(response.data.users);

        const remainingUsers = fetchedUsers.filter(
          (user) => !collaborators.includes(user._id)
        );
        setUsers(remainingUsers);

      }catch (err) {
        console.log(err.response?.data?.error || 'Something went wrong')
      }
    }

    fetchData();
    return () => {
      active = false;
      disconnectSocket();
      serverReadyUnsubscribe.current?.();
      serverReadyUnsubscribe.current = null;
    };
  }, [projectId])

  function saveFileTree(ft){
    axiosInstance.put('/projects/update-file-tree', {
      projectId,
      fileTree: ft
    }).then(res =>{
      console.log(res.data)
    }).catch(err =>{
      console.log(err)
    })
  }

  useGSAP(() => {
    if (isPanelOpen) {
      gsap.to(sidePanel.current, {
        x: "0%",
        duration: 0.3
      });

      gsap.to(isClicked.current, {
        backgroundColor: "#d1d5db",
        duration: 0.3
      });
    } else {
      gsap.to(sidePanel.current, {
        x: "-100%",
        duration: 0.3
      });

      gsap.to(isClicked.current, {
        backgroundColor: "#6a7282",
        duration: 0.3
      });
    }
  }, [isPanelOpen]);

  const handleUserSelect = (userId) => {
  setSelectedUsers((prev) => {

    if (prev.includes(userId)) {
      return prev.filter((id) => id !== userId);
    }

    return [...prev, userId];
  });
};

  const addCollaborators = () => {
    setCollaborators((prev) => {
      return [...prev, ...selectedUsers]
    });

    const postData = async() => {
      try{
        const response = await axiosInstance.put('/projects/add-user',{
          projectId,
          users: selectedUsers
        })
      }catch (err) {
        console.log(err.response?.data?.error || 'Something went wrong')
      }
    }

    postData();

    setUsers((prev) =>
      prev.filter((user) => !selectedUsers.includes(user._id))
    );

    setShowCollaboratorModal(false);
    setSelectedUsers([]);
  };

  const scrollToBottom = () => {
    messageBox.current.scrollTop = messageBox.current.scrollHeight
  }

  return (
    <main className='h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex'>

      {/* ================= Left Chat Section ================= */}

      <section className='h-full w-[22rem] shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col min-h-0'>

        <header className='flex items-center justify-between border-b border-slate-800 px-4 py-3'>

          <button
            onClick={() => setShowCollaboratorModal(true)}
            className='flex items-center justify-start gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white'
          >
            <i className="ri-user-add-line"></i>
            <h3>Add collaborator</h3>
          </button>

          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className='rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white'
          >
            <i
              ref={isClicked}
              className="ri-team-line text-lg"
            ></i>
          </button>

        </header>

        {/* ================= Messages ================= */}

        <div ref={messageBox} className="message-box flex-1 relative min-h-0 grow overflow-y-auto hide-scrollbar px-3 py-4">

          {/* Team Side Panel */}

          <div
            ref={sidePanel}
            className="collaborators-panel absolute left-0 top-0 w-full h-full z-10 border-r border-slate-700 bg-slate-900 hide-scrollbar overflow-auto px-3 translate-x-[-100%]"
          >

            <h3 className='font-semibold text-sm uppercase tracking-wider text-slate-400 p-3 border-b border-slate-800'>
              Team Members
            </h3>

            {collaborators.length === 0 ? (
              <p className='p-3 text-sm text-slate-500'>
                No collaborators added
              </p>
            ) : (
              collaborators.map((id) => {
                const user = allUsers.find((u) => u._id === id);

                return (
                  <div
                    key={id}
                    className="user my-1 rounded-lg p-2.5 flex items-center gap-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    <i className="ri-user-3-line flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-indigo-300"></i>
                    <h5>{user?.email}</h5>
                  </div>
                );
              })
            )}

          </div>

          {
            allMessages.map((msg, idx) =>{
              if(msg.sender === 'gemini'){
                return(
                  <div key={idx} className="incoming rounded-xl rounded-tl-sm border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-slate-100 w-fit overflow-auto max-w-[85%] mt-2">
                    <h6 className='mb-1 text-xs font-medium text-indigo-300'>
                      {msg.email}
                    </h6>
                    <div className="text-sm leading-5">
                      <MarkdownRenderer content={msg.message} />
                    </div>
                  </div>
                )

              }else if (msg.type === 'system') {
                return (
                  <div
                    key={idx}
                    className="text-center text-xs text-slate-500 my-3"
                  >
                    {msg.message}
                  </div>
                );
              }else if(user._id === msg.sender){
                return(
                  <div key={idx} className="outgoing rounded-xl rounded-tr-sm bg-indigo-500 px-3 py-2 w-fit max-w-[85%] overflow-auto mt-2 ml-auto shadow-sm shadow-indigo-950/30">
                    <h6 className='mb-1 text-xs font-medium text-indigo-100'>
                      {msg.email}
                    </h6>
                    <p className='text-sm leading-5'>{msg.message}</p>
                  </div>
                )
              }else{
                return(
                  <div key={idx} className="incoming rounded-xl rounded-tl-sm bg-slate-800 px-3 py-2 w-fit overflow-auto max-w-[85%] mt-2">
                    <h6 className='mb-1 text-xs font-medium text-slate-400'>
                      {msg.email}
                    </h6>
                    <p className='text-sm leading-5'>{msg.message}</p>
                  </div>
                )
              }
            })
          }

          {/* <div className="incoming bg-gray-200 px-2 pb-1 rounded-lg w-fit overflow-auto max-w-70 mt-2 mx-2">
            <h6 className='-mb-0.5 text-sm font-light'>
              example@gmail.com
            </h6>
            <p>Hello</p>
          </div>

          <div className="outgoing bg-gray-400 px-2 pb-1 rounded-lg max-w-70 overflow-auto mt-2 mx-2 ml-auto">
            <h6 className='-mb-0.5 text-sm font-light'>
              example@gmail.com
            </h6>
            <p>Hieee</p>
          </div> */}

        </div>

        {/* ================= Input Box ================= */}

        <div className="input-box m-3 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 shadow-inner">

          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
            }}
            placeholder='Enter a message'
            className='min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500'
          />

          <button onClick={send} className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-400'>
            <i className="ri-send-plane-line text-base"></i>
          </button>

        </div>

      </section>

      <section className="section right h-screen w-full min-w-0 flex bg-slate-950">
        {iFrameUrl && webContainer && 
          <div className='flex flex-col h-full w-[50vw] border-r border-slate-800 bg-white'>
            <div className='border-b border-slate-200 bg-slate-50 px-3 py-2'> <input type="text" value={iFrameUrl} onChange={(e)=> setiFrameUrl(e.target.value)} className='w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400' /></div>
            <iframe src={iFrameUrl} allow="cross-origin-isolated" className='w-full h-full' title="Project preview"></iframe>
          </div>
        }

        <div className="explorer h-full w-64 shrink-0 border-r border-slate-800 bg-slate-900 py-3 flex flex-col justify-between">
          <div>
            <div className='px-4 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500'>Explorer</div>
            <div className="file-tree flex flex-col gap-1 px-2">
            {
              Object.keys(fileTree).map((file, index) => (
                 <button onClick={()=>{
                  setCurrentFile(file)
                 }} key={index} className={`tree-element cursor-pointer rounded-lg py-2 text-left text-sm transition ${currentFile === file ? 'bg-indigo-500/15 text-indigo-200': 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'} px-3`}>
                  <p className='flex items-center gap-2 truncate font-medium'><i className="ri-file-code-line text-base"></i>{file}</p>
                </button>
              ))
            }
            </div>
          </div>
          <div className='mx-3 mb-1'>
            <button disabled={!webContainer} onClick={async () => {
              if (!webContainer) return;
              await webContainer.mount(fileTree);

              const installProcess = await webContainer.spawn("npm", ["install"]);

              installProcess.output.pipeTo(new WritableStream({
                write(chunk) {
                  console.log(chunk);
                }
              }))

              if(runProcess){
                runProcess.kill()
              }

              let tempRunProcess = await webContainer.spawn("npm", ["start"]);

              tempRunProcess.output.pipeTo(new WritableStream({
                write(chunk) {
                  console.log(chunk);
                }
              }))

              setRunProcess(tempRunProcess)

              serverReadyUnsubscribe.current?.();
              serverReadyUnsubscribe.current = webContainer.on('server-ready', (port, url)=>{
                console.log(port, url)
                setiFrameUrl(url)
              })

            }} className='flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50'><i className="ri-play-fill"></i>Run project</button>
          </div>
        </div>
        <div className="code-editor h-full min-w-0 w-full bg-[#1e1e1e] overflow-hidden">
          {fileTree[currentFile] && (
            <Editor
              height="100%"
              width="100%"
              theme="vs-dark"
              language="javascript"
              value={fileTree[currentFile]?.file?.contents || ""}
              onChange={(value) => {
                const updatedFileTree = {
                    ...fileTree,
                    [currentFile]: {
                        ...fileTree[currentFile],
                        file: {
                            ...fileTree[currentFile].file,
                            contents: value
                        }
                    }
                };

                setFileTree(updatedFileTree);
                saveFileTree(updatedFileTree);
            }}
            />
            
          )}
        </div>
      </section>

      {/* ================= Collaborator Modal ================= */}

      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="w-[380px] rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">

            {/* Header */}

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-semibold text-white">
                Select Users
              </h2>

              <button
                onClick={() => {
                  setShowCollaboratorModal(false);
                  setSelectedUsers([]);
                }}
                className="rounded-lg p-1 text-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <i className="ri-close-line"></i>
              </button>

            </div>

            {/* User List */}

            <div className="max-h-[350px] overflow-y-auto">

              {users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-2 border transition-all
                  
                  ${
                    selectedUsers.includes(user._id)
                      ? "bg-indigo-500/15 border-indigo-400 text-white"
                      : "border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >

                  <i className="ri-user-3-fill text-xl text-indigo-300"></i>

                  <div>
                    <h4 className="font-medium text-sm">
                      {user.email}
                    </h4>
                  
                  </div>

                </div>
              ))}

            </div>

            {/* Footer */}

            <button
              onClick={addCollaborators}
              className="w-full mt-4 bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-400 transition"
            >
              Add Collaborators
            </button>

          </div>

        </div>
      )}

    </main>
  );
};

export default Project;
