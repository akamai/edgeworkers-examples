# Example
This example demonstrate usage of HLS module to cater program replacement usecase for live stream.

**Program Replacement (Live):** Enables dynamically replace a live stream (or linear program) with a blackout slate during a time period. The EW will rewrite the playlists when the client requests an update and the blackout period has started. During this period the content segments will be replaced by slate segments. The replacement is at the segment's boundaries. The blackout slate shall have the same stream encoding profile (bitrates, resolutions, encoder, frame alignments, etc) and segment duration as the original content.

To know more info about program replacement usecase, Kindly refer this [documentation](https://techdocs.akamai.com/edgeworkers/docs/live-program-replacement)
