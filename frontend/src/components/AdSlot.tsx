// ─── Ad Slot Component ───────────────────────────────────────
// Snigel/HBAgency ad network pattern.
// Used 6 times on homepage. Must NOT be styled or modified.

export default function AdSlot() {
    return (
        <div className="w-full flex justify-center my-6">
            <div className="hb-ad-inpage">
                <div className="hb-ad-inner">
                    <div className="hbagency_cls hbagency_space_251666"></div>
                </div>
            </div>
        </div>
    )
}
