import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, message, Row, Space } from 'antd';
import { AudioMutedOutlined, AudioOutlined, RedoOutlined, SendOutlined } from '@ant-design/icons';
import themeColor from '../../../../themeColor';
import { MustBeAdminError, postAudioMessage, UserNotInChatError } from '@neelkamath/omni-chat';
import { httpApiConfig } from '../../../../api';
import { Storage } from '../../../../Storage';
import getLocaleDateString from '../../../../getLocaleDateString';

export interface AudioRecorderMessageCreatorProps {
  readonly chatId: number;
}

export default function AudioRecorderMessageCreator({ chatId }: AudioRecorderMessageCreatorProps): ReactElement {
  const [time, setTime] = useState(0);
  const [text, setText] = useState<'Start Recording' | 'Stop Recording' | 'Re-record'>('Start Recording');
  const [icon, setIcon] = useState(<AudioOutlined />);
  const chunks = useRef<Blob[]>([]);
  const blob = useRef<Blob | null>(null);
  const [isLoadingAudio, setAudioLoading] = useState(false);
  const [isSending, setSending] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const hasStopped = useRef(false);
  useEffect(() => {
    if (recorder === null) return;
    recorder.ondataavailable = ({ data }) => {
      chunks.current.push(data);
      if (hasStopped.current) {
        blob.current = new Blob(chunks.current, { type: 'audio/mp3' });
        chunks.current = [];
        setAudioLoading(false);
        setText('Re-record');
        setIcon(<RedoOutlined />);
        hasStopped.current = false;
      } else setTime(time + 1_000);
    };
  }, [recorder, hasStopped, time]);
  const onRecord = useCallback(() => {
    setTime(0);
    recorder!.start(1_000);
    setText('Stop Recording');
    setIcon(<AudioMutedOutlined />);
  }, [recorder]);
  useEffect(() => {
    if (recorder !== null) onRecord();
  }, [recorder, onRecord]);
  const onRecorderClick = () => {
    if (recorder === null)
      navigator.mediaDevices.getUserMedia({ audio: true }).then(
        (stream) => setRecorder(new MediaRecorder(stream)),
        (error) => {
          const description = getErrorMessage(error);
          if (description !== undefined) message.error(description, 7.5);
        },
      );
    else
      switch (recorder.state) {
        case 'inactive':
          onRecord();
          break;
        case 'recording':
          setAudioLoading(true);
          hasStopped.current = true;
          recorder.requestData();
          recorder.stop();
      }
  };
  const onSend = async () => {
    setSending(true);
    await createMessage(chatId, blob.current!);
    setSending(false);
  };
  return (
    <Card size='small'>
      {text === 'Stop Recording' && (
        <Row justify='space-around'>
          <Feedback time={time} />
        </Row>
      )}
      {text === 'Re-record' && (
        <Row justify='space-around'>
          <audio controls src={URL.createObjectURL(blob.current)} />
        </Row>
      )}
      <Row style={{ marginTop: text !== 'Start Recording' ? 16 : 0 }} justify='space-around'>
        <Button
          type={text !== 'Re-record' ? 'primary' : 'default'}
          loading={isLoadingAudio}
          icon={icon}
          onClick={onRecorderClick}
        >
          {text}
        </Button>
      </Row>
      {text === 'Re-record' && (
        <Row style={{ marginTop: 16 }} justify='space-around'>
          <Button type='primary' loading={isSending} icon={<SendOutlined />} onClick={onSend}>
            Send
          </Button>
        </Row>
      )}
    </Card>
  );
}

async function createMessage(chatId: number, blob: Blob): Promise<void> {
  try {
    const file = new File([blob], `Recording on ${getLocaleDateString(Date.now())}.mp3`);
    await postAudioMessage(httpApiConfig, Storage.readAccessToken()!, file, chatId);
  } catch (error) {
    if (error instanceof UserNotInChatError) message.error("You're no longer in the chat.", 5);
    else if (error instanceof MustBeAdminError) message.error('Only admins can send messages in broadcast chats.', 5);
  }
}

function getErrorMessage({ name, message }: Error): string {
  switch (name) {
    case 'NotAllowedError':
      return 'You must grant microphone access to record an audio message.';
    case 'NotFoundError':
      return "You can't record an audio message because you're device doesn't have an accessible microphone.";
    case 'OverconstrainedError':
      return message;
    default:
      return 'An unexpected error occurred. Try refreshing the page. If the problem persists, reach out to us.';
  }
}

interface FeedbackProps {
  readonly time: number;
}

function Feedback({ time }: FeedbackProps): ReactElement {
  return (
    <Space direction='vertical'>
      <Row justify='space-around'>
        <Visualizer />
      </Row>
      <Row style={{ marginTop: 16 }} justify='space-around'>
        <Time milliseconds={time} />
      </Row>
    </Space>
  );
}

interface TimeProps {
  readonly milliseconds: number;
}

function Time({ milliseconds }: TimeProps): ReactElement {
  const minute = 60 * 1_000;
  const minutes = Math.floor(milliseconds / minute);
  const seconds = (milliseconds % minute) / 1_000;
  const text = seconds === 60 ? `${minutes + 1}:00 elapsed` : `${minutes}:${seconds < 10 ? '0' : ''}${seconds} elapsed`;
  return <>{text}</>;
}

// Based on https://github.com/mdn/web-dictaphone/blob/28f4bea6994f2f7b74317144659ad02161015ab4/scripts/app.js#L117.
function Visualizer(): ReactElement {
  const canvas = useRef<HTMLCanvasElement>(null);
  const element = <canvas ref={canvas} height='100' />;
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => visualize(canvas.current!, stream), console.error);
  }, []);
  return element;
}

function visualize(canvas: HTMLCanvasElement, stream: MediaStream): void {
  const context = window.AudioContext ?? window.webkitAudioContext;
  const audioContext = new context();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2_048;
  audioContext.createMediaStreamSource(stream).connect(analyser);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  draw(canvas, canvas.getContext('2d')!, analyser, dataArray);
}

function draw(
  canvas: HTMLCanvasElement,
  canvasContext: CanvasRenderingContext2D,
  analyser: AnalyserNode,
  dataArray: Uint8Array,
): void {
  if (canvas === null) return;
  requestAnimationFrame(() => draw(canvas, canvasContext, analyser, dataArray));
  analyser.getByteTimeDomainData(dataArray);
  canvasContext.fillStyle = 'white';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  canvasContext.lineWidth = 2;
  canvasContext.strokeStyle = themeColor;
  canvasContext.beginPath();
  const sliceWidth = canvas.width / analyser.frequencyBinCount;
  let x = 0;
  for (let index = 0; index < analyser.frequencyBinCount; index++) {
    const v = dataArray[index]! / 128.0;
    const y = (v * canvas.height) / 2;
    index === 0 ? canvasContext.moveTo(x, y) : canvasContext.lineTo(x, y);
    x += sliceWidth;
  }
  canvasContext.lineTo(canvas.width, canvas.height / 2);
  canvasContext.stroke();
}
