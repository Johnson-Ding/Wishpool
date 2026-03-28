package com.wishpool.app.designsystem.theme

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class WishpoolPaletteTest {

    @Test
    fun `cloud palette uses light background and white cards`() {
        val palette = wishpoolPaletteFor(WishpoolThemeType.CLOUD)

        assertEquals(CloudBackground, palette.screenBackground)
        assertEquals(CloudCard, palette.cardBackground)
        assertEquals(CloudPrimary, palette.primaryAccent)
        assertEquals(CloudAccent, palette.secondaryAccent)
        assertFalse(palette.showStars)
    }

    @Test
    fun `moon palette keeps dark background and starfield`() {
        val palette = wishpoolPaletteFor(WishpoolThemeType.MOON)

        assertEquals(MoonBackground, palette.screenBackground)
        assertEquals(MoonCard, palette.cardBackground)
        assertEquals(MoonGold, palette.primaryAccent)
        assertEquals(MoonTeal, palette.secondaryAccent)
        assertTrue(palette.showStars)
    }
}
