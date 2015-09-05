package ut.name.vitaly.burlai;

import org.junit.Test;
import name.vitaly.burlai.MyPluginComponent;
import name.vitaly.burlai.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}