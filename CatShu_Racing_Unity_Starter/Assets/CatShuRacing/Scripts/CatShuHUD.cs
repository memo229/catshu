using UnityEngine;
using UnityEngine.UI;

public class CatShuHUD : MonoBehaviour
{
    public CatShuCarController car;
    public Text speedText;
    public Text modeText;
    public Slider nitroSlider;

    void Update()
    {
        if (!car) return;

        if (speedText)
            speedText.text = Mathf.RoundToInt(car.SpeedKmh) + " KM/H";

        if (nitroSlider)
            nitroSlider.value = car.Nitro01;

        if (modeText)
            modeText.text = Input.GetKey(KeyCode.LeftShift) ? "NITRO" :
                            Input.GetKey(KeyCode.Space) ? "DRIFT" : "DRIVE";
    }
}
