/** De stem van Sophie ontwerpen (los geladen: alleen nodig met een ElevenLabs-sleutel). */
import { HOST, HOST_ID, HOST_NAME } from '@/data/podcastHost';
import { VoiceDesignCard } from '@/features/voice/settingsParts';
import { tp } from '@/i18n/podcast';

export function HostVoiceCard() {
  return (
    <VoiceDesignCard
      meta={{ id: HOST_ID, name: HOST_NAME }}
      spec={HOST.voice}
      title={tp.host.title}
      body={tp.host.body}
    />
  );
}
